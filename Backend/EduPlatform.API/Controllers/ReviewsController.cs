using System.Text.Json;
using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stages")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStages()
    {
        var quizzes = await _db.ReviewQuizzes
            .Where(q => q.IsActive)
            .Include(q => q.Questions)
            .OrderBy(q => q.CreatedAt)
            .ToListAsync();

        var result = quizzes
            .GroupBy(q => q.Stage)
            .Select(g => new ReviewStageSummaryDto
            {
                Stage = g.Key.ToString(),
                Quizzes = g.Select(q => new ReviewQuizSummaryDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    QuestionCount = q.Questions.Count
                }).ToList()
            })
            .ToList();

        return Ok(result);
    }

    [HttpGet("quizzes/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetQuiz(int id)
    {
        var quiz = await _db.ReviewQuizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id && q.IsActive);

        if (quiz == null) return NotFound("المراجعة غير موجودة");

        var dto = new ReviewQuizPublicDto
        {
            Id = quiz.Id,
            Title = quiz.Title,
            Stage = quiz.Stage.ToString(),
            Questions = quiz.Questions
                .OrderBy(q => q.Order)
                .Select(q => new ReviewQuestionPublicDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Order = q.Order,
                    Options = JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? new List<string>()
                })
                .ToList()
        };

        return Ok(dto);
    }

    [HttpPost("quizzes/{id}/submit")]
    [AllowAnonymous]
    public async Task<IActionResult> Submit(int id, ReviewSubmitDto dto)
    {
        var studentName = dto.StudentName?.Trim();
        if (string.IsNullOrWhiteSpace(studentName))
            return BadRequest("من فضلك اكتب اسمك");

        var quiz = await _db.ReviewQuizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id && q.IsActive);

        if (quiz == null) return NotFound("المراجعة غير موجودة");

        var alreadyAttempted = await _db.ReviewAttempts
            .AnyAsync(a => a.ReviewQuizId == id && a.StudentName == studentName);

        if (alreadyAttempted)
            return Conflict("لقد قمت بحل هذه المراجعة من قبل بهذا الاسم");

        var score = 0;
        foreach (var question in quiz.Questions)
        {
            var answer = dto.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            if (answer != null && answer.SelectedOptionIndex == question.CorrectOptionIndex)
                score++;
        }

        var attempt = new ReviewAttempt
        {
            ReviewQuizId = id,
            StudentName = studentName,
            Score = score,
            TotalQuestions = quiz.Questions.Count,
            DurationSeconds = dto.DurationSeconds,
            CreatedAt = DateTime.UtcNow
        };

        _db.ReviewAttempts.Add(attempt);
        await _db.SaveChangesAsync();

        var rank = await _db.ReviewAttempts
            .Where(a => a.ReviewQuizId == id &&
                (a.Score > attempt.Score || (a.Score == attempt.Score && a.DurationSeconds < attempt.DurationSeconds)))
            .CountAsync() + 1;

        return Ok(new ReviewSubmitResultDto
        {
            Score = score,
            TotalQuestions = quiz.Questions.Count,
            Rank = rank
        });
    }

    [HttpGet("quizzes/{id}/leaderboard")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLeaderboard(int id)
    {
        var entries = await _db.ReviewAttempts
            .Where(a => a.ReviewQuizId == id)
            .OrderByDescending(a => a.Score)
            .ThenBy(a => a.DurationSeconds)
            .Take(50)
            .Select(a => new ReviewLeaderboardEntryDto
            {
                StudentName = a.StudentName,
                Score = a.Score,
                TotalQuestions = a.TotalQuestions,
                DurationSeconds = a.DurationSeconds,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(entries);
    }
}
