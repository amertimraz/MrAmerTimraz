using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IHttpClientFactory _http;

    public AiController(IHttpClientFactory http) => _http = http;

    [HttpPost("describe")]
    public async Task<IActionResult> Describe([FromBody] AiDescribeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("العنوان مطلوب");

        var prompt = $"اكتب وصفاً تعليمياً قصيراً باللغة العربية (3-4 جمل فقط) لـ {req.Context} بعنوان: \"{req.Title}\". الوصف يجب أن يكون مناسباً للطلاب وواضحاً ومفيداً. أرسل الوصف فقط بدون أي مقدمة أو تعليق.";

        try
        {
            var client = _http.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(30);

            var body = new
            {
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                model = "openai",
                seed = 42
            };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://text.pollinations.ai/", content);
            var text = await response.Content.ReadAsStringAsync();

            text = text.Trim().Trim('"');

            return Ok(new { description = text });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "فشل الاتصال بخدمة AI: " + ex.Message });
        }
    }
}

public class AiDescribeRequest
{
    public string Title { get; set; } = string.Empty;
    public string Context { get; set; } = "كورس تعليمي";
}
