using EduPlatform.API.Data;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/interactive-quizzes")]
public class InteractiveQuizzesController : ControllerBase
{
    private readonly AppDbContext _db;

    public InteractiveQuizzesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var quizzes = await _db.InteractiveQuizzes
            .Include(q => q.Questions)
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => new
            {
                q.Id, q.Title, q.Subject, q.Grade, q.Description, q.CoverImageUrl, q.Slug,
                q.TeacherName, q.TeacherImage, q.WhatsappUrl, q.YoutubeUrl, q.FacebookUrl, q.ShowSupportButton,
                q.AllowSkipWithoutRegistration,
                q.StageCount, q.QuestionsPerStage, q.McqPerStage, q.TfPerStage,
                q.GoldenEvery, q.TimerEnabled, q.TimerDuration,
                q.ViewCount, q.Theme, q.CreatedAt,
                QuestionCount = q.Questions.Count
            })
            .ToListAsync();
        return Ok(quizzes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var quiz = await _db.InteractiveQuizzes
            .Include(q => q.Questions.OrderBy(q => q.OrderIndex))
            .FirstOrDefaultAsync(q => q.Id == id);
        return quiz == null ? NotFound() : Ok(quiz);
    }

    [HttpGet("slug/{slug}"), AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var slugLower = slug.ToLower().Trim();
        var quiz = await _db.InteractiveQuizzes
            .Include(q => q.Questions.OrderBy(q => q.OrderIndex))
            .FirstOrDefaultAsync(q => q.Slug.ToLower() == slugLower);
        return quiz == null ? NotFound() : Ok(quiz);
    }

    [HttpPost("{id}/view"), AllowAnonymous]
    public async Task<IActionResult> IncrementView(int id)
    {
        await _db.InteractiveQuizzes
            .Where(q => q.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(q => q.ViewCount, q => q.ViewCount + 1));
        var count = await _db.InteractiveQuizzes.Where(q => q.Id == id).Select(q => q.ViewCount).FirstOrDefaultAsync();
        return Ok(new { viewCount = count });
    }

    [HttpPost, Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Create([FromBody] CreateQuizDto dto)
    {
        var quiz = new InteractiveQuiz
        {
            Title = dto.Title,
            Subject = dto.Subject,
            Grade = dto.Grade,
            Description = dto.Description,
            CoverImageUrl = dto.CoverImageUrl,
            Slug = dto.Slug,
            TeacherName = dto.TeacherName,
            TeacherImage = dto.TeacherImage,
            WhatsappUrl = dto.WhatsappUrl,
            TeacherWhatsappNumber = dto.TeacherWhatsappNumber,
            ShowSupportButton = dto.ShowSupportButton,
            AllowSkipWithoutRegistration = dto.AllowSkipWithoutRegistration,
            StageCount = dto.StageCount,
            QuestionsPerStage = dto.QuestionsPerStage,
            McqPerStage = dto.McqPerStage,
            TfPerStage = dto.TfPerStage,
            GoldenEvery = dto.GoldenEvery,
            TimerEnabled = dto.TimerEnabled,
            TimerDuration = dto.TimerDuration,
            Theme = dto.Theme ?? "Default"
        };
        _db.InteractiveQuizzes.Add(quiz);
        await _db.SaveChangesAsync();
        return Ok(quiz);
    }

    [HttpPut("{id}"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateQuizDto dto)
    {
        var quiz = await _db.InteractiveQuizzes.FindAsync(id);
        if (quiz == null) return NotFound();
        quiz.Title = dto.Title;
        quiz.Subject = dto.Subject;
        quiz.Grade = dto.Grade;
        quiz.Description = dto.Description;
        quiz.CoverImageUrl = dto.CoverImageUrl;
        quiz.Slug = dto.Slug;
        quiz.TeacherName = dto.TeacherName;
        quiz.TeacherImage = dto.TeacherImage;
        quiz.WhatsappUrl = dto.WhatsappUrl;
        quiz.TeacherWhatsappNumber = dto.TeacherWhatsappNumber;
        quiz.YoutubeUrl = dto.YoutubeUrl;
        quiz.FacebookUrl = dto.FacebookUrl;
        quiz.ShowSupportButton = dto.ShowSupportButton;
        quiz.AllowSkipWithoutRegistration = dto.AllowSkipWithoutRegistration;
        quiz.StageCount = dto.StageCount;
        quiz.QuestionsPerStage = dto.QuestionsPerStage;
        quiz.McqPerStage = dto.McqPerStage;
        quiz.TfPerStage = dto.TfPerStage;
        quiz.GoldenEvery = dto.GoldenEvery;
        quiz.TimerEnabled = dto.TimerEnabled;
        quiz.TimerDuration = dto.TimerDuration;
        quiz.Theme = dto.Theme ?? quiz.Theme;
        await _db.SaveChangesAsync();
        return Ok(quiz);
    }

    [HttpDelete("{id}"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var quiz = await _db.InteractiveQuizzes.FindAsync(id);
        if (quiz == null) return NotFound();

        // Delete related questions first
        var questions = await _db.InteractiveQuestions.Where(q => q.QuizId == id).ToListAsync();
        _db.InteractiveQuestions.RemoveRange(questions);

        // Delete related results
        var results = await _db.InteractiveQuizResults.Where(r => r.QuizId == id).ToListAsync();
        _db.InteractiveQuizResults.RemoveRange(results);

        // Now delete the quiz
        _db.InteractiveQuizzes.Remove(quiz);
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("{id}/duplicate"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Duplicate(int id)
    {
        var original = await _db.InteractiveQuizzes
            .Include(q => q.Questions.OrderBy(q => q.OrderIndex))
            .FirstOrDefaultAsync(q => q.Id == id);
        if (original == null) return NotFound();

        var copy = new InteractiveQuiz
        {
            Title = original.Title + " (نسخة)",
            Subject = original.Subject,
            Grade = original.Grade,
            Description = original.Description,
            CoverImageUrl = original.CoverImageUrl,
            TeacherName = original.TeacherName,
            TeacherImage = original.TeacherImage,
            WhatsappUrl = original.WhatsappUrl,
            YoutubeUrl = original.YoutubeUrl,
            FacebookUrl = original.FacebookUrl,
            ShowSupportButton = original.ShowSupportButton,
            Theme = original.Theme,
            Questions = original.Questions.Select((q, i) => new InteractiveQuestion
            {
                Text = q.Text,
                Type = q.Type,
                Options = q.Options,
                CorrectAnswer = q.CorrectAnswer,
                Explanation = q.Explanation,
                OrderIndex = i
            }).ToList()
        };

        _db.InteractiveQuizzes.Add(copy);
        await _db.SaveChangesAsync();
        return Ok(copy);
    }

    [HttpPost("{id}/questions/bulk"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> BulkAddQuestions(int id, [FromBody] List<CreateIQuestionDto> questions)
    {
        var quiz = await _db.InteractiveQuizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id);
        if (quiz == null) return NotFound();

        var maxOrder = quiz.Questions.Any() ? quiz.Questions.Max(q => q.OrderIndex) : -1;

        try
        {
            foreach (var (dto, i) in questions.Select((q, i) => (q, i)))
            {
                quiz.Questions.Add(new InteractiveQuestion
                {
                    Text = dto.Text,
                    Type = dto.Type == "TrueFalse" ? IQType.TrueFalse : IQType.MCQ,
                    Options = dto.Options,
                    CorrectAnswer = dto.CorrectAnswer,
                    Explanation = dto.Explanation,
                    OrderIndex = maxOrder + 1 + i
                });
            }

            await _db.SaveChangesAsync();
            return Ok(new { added = questions.Count });
        }
        catch (DbUpdateException dex) when (dex.InnerException?.Message.Contains("duplicate key") == true)
        {
            try
            {
#pragma warning disable EF1002
                await _db.Database.ExecuteSqlRawAsync("""SELECT setval(pg_get_serial_sequence('public."InteractiveQuestions"', 'Id'), (SELECT MAX("Id") FROM "InteractiveQuestions") + 1);""");
#pragma warning restore EF1002
            }
            catch { }
            return StatusCode(500, new { error = "تم إعادة تعيين الأسئلة، حاول مرة أخرى" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpDelete("{id}/questions"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> ClearQuestions(int id)
    {
        var qs = await _db.InteractiveQuestions.Where(q => q.QuizId == id).ToListAsync();
        _db.InteractiveQuestions.RemoveRange(qs);
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("questions/{questionId}"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> UpdateQuestion(int questionId, [FromBody] CreateIQuestionDto dto)
    {
        var q = await _db.InteractiveQuestions.FindAsync(questionId);
        if (q == null) return NotFound();
        q.Text = dto.Text;
        q.Type = dto.Type == "TrueFalse" ? IQType.TrueFalse : IQType.MCQ;
        q.Options = dto.Options;
        q.CorrectAnswer = dto.CorrectAnswer;
        q.Explanation = dto.Explanation;
        await _db.SaveChangesAsync();
        return Ok(q);
    }

    [HttpDelete("questions/{questionId}"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DeleteQuestion(int questionId)
    {
        var q = await _db.InteractiveQuestions.FindAsync(questionId);
        if (q == null) return NotFound();
        _db.InteractiveQuestions.Remove(q);
        await _db.SaveChangesAsync();
        return Ok();
    }
 
    [HttpGet("{id}/leaderboard"), AllowAnonymous]
    public async Task<IActionResult> GetLeaderboard(int id)
    {
        var allResults = await _db.InteractiveQuizResults
            .Where(r => r.QuizId == id)
            .ToListAsync();

        Console.WriteLine($"[DEBUG] Quiz {id} total results in DB: {allResults.Count}");

        var rawResults = await _db.InteractiveQuizResults
            .Where(r => r.QuizId == id)
            .OrderByDescending(r => r.Score)
            .ThenByDescending(r => r.Percentage)
            .ThenBy(r => r.CompletedAt)
            .Take(200)
            .Select(r => new
            {
                r.PlayerName,
                r.Score,
                r.CorrectCount,
                r.TotalCount,
                r.Percentage,
                r.CompletedAt
            })
            .ToListAsync();

        Console.WriteLine($"[DEBUG] Quiz {id} returned results: {rawResults.Count}");

        var leaderboard = rawResults.Select(r => new
        {
            name = r.PlayerName,
            score = r.Score,
            correct = r.CorrectCount,
            total = r.TotalCount,
            pct = r.Percentage,
            date = r.CompletedAt.ToString("yyyy/MM/dd")
        });

        return Ok(leaderboard);
    }
 
    [HttpPost("{id}/results"), AllowAnonymous]
    public async Task<IActionResult> SubmitResult(int id, [FromBody] SubmitQuizResultDto dto)
    {
        var quiz = await _db.InteractiveQuizzes.FindAsync(id);
        if (quiz == null) return NotFound();
 
        var existing = await _db.InteractiveQuizResults
            .FirstOrDefaultAsync(r => r.QuizId == id && r.SessionId == dto.sessionId);

        if (existing != null)
        {
            existing.PlayerName = dto.name;
            existing.Score = dto.score;
            existing.CorrectCount = dto.correct;
            existing.TotalCount = dto.total;
            existing.Percentage = dto.pct;
            existing.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        var result = new InteractiveQuizResult
        {
            QuizId = id,
            SessionId = dto.sessionId,
            PlayerName = dto.name,
            Score = dto.score,
            CorrectCount = dto.correct,
            TotalCount = dto.total,
            Percentage = dto.pct,
            CompletedAt = DateTime.UtcNow
        };
 
        _db.InteractiveQuizResults.Add(result);
        await _db.SaveChangesAsync();
        return Ok(result);
    }
}

public class CreateQuizDto
{
    public string Title { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? Grade { get; set; }
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Slug { get; set; }
    public string? TeacherName { get; set; }
    public string? TeacherImage { get; set; }
    public string? WhatsappUrl { get; set; }
    public string? TeacherWhatsappNumber { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public bool ShowSupportButton { get; set; } = true;
    public bool AllowSkipWithoutRegistration { get; set; } = true;
    
    public int StageCount { get; set; } = 3;
    public int QuestionsPerStage { get; set; } = 0;
    public int McqPerStage { get; set; } = 0;
    public int TfPerStage { get; set; } = 0;
    public int GoldenEvery { get; set; } = 10;
    public bool TimerEnabled { get; set; } = false;
    public int TimerDuration { get; set; } = 30;

    public string? Theme { get; set; } = "Default";
}

public class CreateIQuestionDto
{
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = "MCQ";
    public string? Options { get; set; }
    public string? CorrectAnswer { get; set; }
    public string? Explanation { get; set; }
}
 
public class SubmitQuizResultDto
{
    public string sessionId { get; set; } = string.Empty;
    public string name { get; set; } = string.Empty;
    public int score { get; set; }
    public int correct { get; set; }
    public int total { get; set; }
    public double pct { get; set; }
}
