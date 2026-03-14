using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using OpenAI;
using OpenAI.Chat;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IConfiguration _config;

    public AiController(IConfiguration config) => _config = config;

    private ChatClient GetChat(string? modelOverride = null)
    {
        var apiKey = _config["AI:Groq:ApiKey"] ?? throw new InvalidOperationException("Groq API key not configured");
        var baseUrl = _config["AI:Groq:BaseUrl"] ?? "https://api.groq.com/openai/v1";
        var model = modelOverride ?? _config["AI:Groq:Model"] ?? "llama-3.3-70b-versatile";

        var options = new OpenAIClientOptions
        {
            Endpoint = new Uri(baseUrl)
        };
        return new OpenAIClient(new System.ClientModel.ApiKeyCredential(apiKey), options).GetChatClient(model);
    }

    private static async Task<string> Ask(ChatClient chat, string system, string user)
    {
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(system),
            new UserChatMessage(user)
        };
        var result = await chat.CompleteChatAsync(messages);
        return result.Value.Content[0].Text.Trim();
    }

    [HttpPost("describe")]
    public async Task<IActionResult> Describe([FromBody] AiDescribeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("العنوان مطلوب");

        try
        {
            var chat = GetChat();
            var text = await Ask(chat,
                "أنت مساعد تعليمي. اكتب وصفاً تعليمياً قصيراً بالعربية (3-4 جمل). أرسل الوصف فقط.",
                $"اكتب وصفاً لـ {req.Context} بعنوان: \"{req.Title}\"");
            return Ok(new { description = text });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "فشل الاتصال بـ Groq: " + ex.Message });
        }
    }

    [HttpPost("parse-quiz")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> ParseQuiz([FromBody] ParseQuizRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest("النص مطلوب");

        var text = req.Text.Length > 8000 ? req.Text[..8000] : req.Text;
        var exampleMcq = """{"text":"question text","type":"MCQ","options":["a","b","c","d"],"correctAnswer":"0"}""";
        var exampleTf = """{"text":"statement","type":"TrueFalse","options":["صح","خطأ"],"correctAnswer":"true"}""";

        var typeRule = string.IsNullOrWhiteSpace(req.ForceType) ? 
            "- type is \"MCQ\" for multiple choice, \"TrueFalse\" for true/false" :
            $"- ALL questions MUST have type \"{req.ForceType}\" - do not change this type";

        var prompt = $"""
Extract quiz questions from the Arabic text below. Return ONLY a valid JSON array. No explanation, no markdown.

Format each MCQ as: {exampleMcq}
Format each true/false as: {exampleTf}

Rules:
{typeRule}
- correctAnswer for MCQ is index "0","1","2","3" or null if unknown
- correctAnswer for TrueFalse is "true" or "false" or null
- Remove question numbers from text
- If correct answer is mentioned, use it

TEXT:
{text}
""";

        try
        {
            var chat = GetChat();
            var rawText = await Ask(chat,
                "You are a JSON API. Return ONLY valid JSON arrays. Never use markdown. Never add explanation.",
                prompt);

            var cleaned = StripMarkdown(rawText);
            var jsonArray = ExtractJsonArray(cleaned);
            if (jsonArray == null)
                return StatusCode(500, new { error = "لم يتمكن الذكاء الاصطناعي من استخراج الأسئلة." });

            using var doc = JsonDocument.Parse(jsonArray);
            var questions = new List<object>();

            foreach (var el in doc.RootElement.EnumerateArray())
            {
                var qText = el.TryGetProperty("text", out var t) ? t.GetString() ?? "" : "";
                if (string.IsNullOrWhiteSpace(qText)) continue;

                var opts = el.TryGetProperty("options", out var o)
                    ? o.EnumerateArray().Select(x => x.GetString() ?? "").Where(s => s.Length > 0).ToList()
                    : new List<string>();

                string? ca = null;
                if (el.TryGetProperty("correctAnswer", out var caEl) && caEl.ValueKind != JsonValueKind.Null)
                    ca = caEl.ValueKind == JsonValueKind.Number ? caEl.GetInt32().ToString() : caEl.GetString();

                questions.Add(new
                {
                    text = qText,
                    type = el.TryGetProperty("type", out var tp) ? tp.GetString() ?? "MCQ" : "MCQ",
                    options = opts,
                    correctAnswer = ca
                });
            }

            if (questions.Count == 0)
                return StatusCode(500, new { error = "لم يتمكن الذكاء الاصطناعي من استخراج أسئلة." });

            return Ok(new { questions });
        }
        catch (JsonException ex)
        {
            return StatusCode(500, new { error = $"تعذّر تحليل الاستجابة: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "فشل الاتصال بـ Groq: " + ex.Message });
        }
    }

    [HttpPost("detect-answer")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DetectAnswer([FromBody] DetectAnswerRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest("السؤال مطلوب");

        var isTF = req.Type == "TrueFalse";

        try
        {
            var chat = GetChat();
            string? ca = null;

            if (isTF)
            {
                var answer = await Ask(chat,
                    "You answer Arabic true/false educational questions. Reply ONLY with: true or false",
                    $"Is this statement true or false?\n{req.Text}");
                var low = answer.ToLowerInvariant();
                if (low.Contains("true") || low.Contains("صح")) ca = "true";
                else if (low.Contains("false") || low.Contains("خطأ")) ca = "false";
            }
            else
            {
                var numbered = string.Join("\n", req.Options.Select((o, i) => $"{i + 1}. {o}"));
                var answer = await Ask(chat,
                    "You are an Arabic educational quiz expert. Reply ONLY with the number of the correct answer (1, 2, 3, or 4). Nothing else.",
                    $"Question: {req.Text}\n\nOptions:\n{numbered}\n\nCorrect answer number:");

                var m = System.Text.RegularExpressions.Regex.Match(answer.Trim(), @"^[1-4]");
                if (m.Success)
                {
                    int idx = int.Parse(m.Value) - 1;
                    if (idx >= 0 && idx < req.Options.Count)
                        ca = idx.ToString();
                }
            }

            return Ok(new { correctAnswer = ca, hint = ca == null ? "لم يتمكن AI من تحديد الإجابة" : null });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "فشل الاتصال بـ Groq: " + ex.Message });
        }
    }

    private static string StripMarkdown(string text)
    {
        text = text.Trim();
        var codeBlock = System.Text.RegularExpressions.Regex.Match(
            text, @"```(?:json)?\s*([\s\S]*?)```",
            System.Text.RegularExpressions.RegexOptions.Singleline);
        if (codeBlock.Success)
            text = codeBlock.Groups[1].Value.Trim();
        return text;
    }

    private static string? ExtractJsonArray(string text)
    {
        text = text.Trim();
        if (text.StartsWith('[')) return text;
        var match = System.Text.RegularExpressions.Regex.Match(
            text, @"\[[\s\S]*\]",
            System.Text.RegularExpressions.RegexOptions.Singleline);
        return match.Success ? match.Value : null;
    }
}

public class AiDescribeRequest
{
    public string Title { get; set; } = string.Empty;
    public string Context { get; set; } = "كورس تعليمي";
}

public class ParseQuizRequest
{
    public string Text { get; set; } = string.Empty;
    public string? ForceType { get; set; }
}

public class DetectAnswerRequest
{
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = "MCQ";
    public List<string> Options { get; set; } = new();
}
