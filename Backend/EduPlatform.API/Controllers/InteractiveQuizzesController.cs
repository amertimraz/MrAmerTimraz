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
                q.Id, q.Title, q.Subject, q.Grade, q.Description, q.CoverImageUrl, q.CreatedAt,
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

    [HttpPost, Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Create([FromBody] CreateQuizDto dto)
    {
        var quiz = new InteractiveQuiz
        {
            Title = dto.Title,
            Subject = dto.Subject,
            Grade = dto.Grade,
            Description = dto.Description,
            CoverImageUrl = dto.CoverImageUrl
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
        await _db.SaveChangesAsync();
        return Ok(quiz);
    }

    [HttpDelete("{id}"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var quiz = await _db.InteractiveQuizzes.FindAsync(id);
        if (quiz == null) return NotFound();
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
}

public class CreateQuizDto
{
    public string Title { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? Grade { get; set; }
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
}

public class CreateIQuestionDto
{
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = "MCQ";
    public string? Options { get; set; }
    public string? CorrectAnswer { get; set; }
    public string? Explanation { get; set; }
}
