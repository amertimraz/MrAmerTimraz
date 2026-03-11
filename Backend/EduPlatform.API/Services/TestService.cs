using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EduPlatform.API.Services;

public interface ITestService
{
    Task<List<TestDto>> GetByCourseAsync(int courseId);
    Task<List<TestDto>> GetByTeacherAsync(int teacherId);
    Task<TestDto?> GetByIdAsync(int id, bool includeAnswers = false);
    Task<TestDto> CreateAsync(CreateTestDto dto);
    Task<bool> AddQuestionAsync(int testId, CreateQuestionDto dto);
    Task<bool> DeleteQuestionAsync(int questionId);
    Task<bool> PublishAsync(int testId);
    Task<TestResultDto?> SubmitAsync(SubmitTestDto dto, int studentId);
    Task<List<Result>> GetStudentResultsAsync(int studentId);
    Task<List<Result>> GetTestResultsAsync(int testId);
    Task<bool> DeleteTestAsync(int testId);
}

public class TestService : ITestService
{
    private readonly AppDbContext _db;

    public TestService(AppDbContext db) => _db = db;

    public async Task<List<TestDto>> GetByCourseAsync(int courseId)
    {
        return await _db.Tests
            .Where(t => t.CourseId == courseId)
            .Include(t => t.Questions)
            .Include(t => t.Course)
            .Select(t => MapToDto(t, false))
            .ToListAsync();
    }

    public async Task<List<TestDto>> GetByTeacherAsync(int teacherId)
    {
        var tests = await _db.Tests
            .Where(t => t.Course != null && t.Course.CreatedBy == teacherId)
            .Include(t => t.Questions.OrderBy(q => q.OrderIndex))
            .Include(t => t.Course)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
        return tests.Select(t => MapToDto(t, true)).ToList();
    }

    public async Task<TestDto?> GetByIdAsync(int id, bool includeAnswers = false)
    {
        var test = await _db.Tests
            .Include(t => t.Questions.OrderBy(q => q.OrderIndex))
            .Include(t => t.Course)
            .FirstOrDefaultAsync(t => t.Id == id);

        return test == null ? null : MapToDto(test, includeAnswers);
    }

    public async Task<TestDto> CreateAsync(CreateTestDto dto)
    {
        var test = new Test
        {
            Title = dto.Title,
            Description = dto.Description,
            CourseId = dto.CourseId,
            DurationMinutes = dto.DurationMinutes,
            PassingScore = dto.PassingScore
        };

        _db.Tests.Add(test);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(test.Id) ?? MapToDto(test, false);
    }

    public async Task<bool> AddQuestionAsync(int testId, CreateQuestionDto dto)
    {
        var test = await _db.Tests.FindAsync(testId);
        if (test == null) return false;

        _db.Questions.Add(new Question
        {
            TestId = testId,
            QuestionText = dto.QuestionText,
            QuestionType = dto.QuestionType,
            Options = dto.Options,
            CorrectAnswer = dto.CorrectAnswer,
            Points = dto.Points,
            OrderIndex = dto.OrderIndex,
            ImageUrl = dto.ImageUrl
        });

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteQuestionAsync(int questionId)
    {
        var q = await _db.Questions.FindAsync(questionId);
        if (q == null) return false;
        _db.Questions.Remove(q);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> PublishAsync(int testId)
    {
        var test = await _db.Tests.FindAsync(testId);
        if (test == null) return false;
        test.IsPublished = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<TestResultDto?> SubmitAsync(SubmitTestDto dto, int studentId)
    {
        var test = await _db.Tests
            .Include(t => t.Questions)
            .FirstOrDefaultAsync(t => t.Id == dto.TestId);

        if (test == null) return null;

        float score = 0;
        float maxScore = test.Questions.Sum(q => q.Points);

        foreach (var answer in dto.Answers)
        {
            var question = test.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
            if (question == null) continue;

            var correctAnswer = question.CorrectAnswer?.Trim().ToLower();
            var studentAnswer = answer.Answer.Trim().ToLower();

            if (question.QuestionType == QuestionType.Ordering)
            {
                if (correctAnswer == studentAnswer) score += question.Points;
            }
            else
            {
                if (correctAnswer == studentAnswer) score += question.Points;
            }
        }

        float percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        bool passed = percentage >= test.PassingScore;

        var result = new Result
        {
            StudentId = studentId,
            TestId = dto.TestId,
            Score = score,
            MaxScore = maxScore,
            Passed = passed,
            Answers = JsonSerializer.Serialize(dto.Answers)
        };

        _db.Results.Add(result);
        await _db.SaveChangesAsync();

        return new TestResultDto
        {
            ResultId = result.Id,
            Score = score,
            MaxScore = maxScore,
            Percentage = percentage,
            Passed = passed,
            PassingScore = test.PassingScore,
            CompletedAt = result.CompletedAt
        };
    }

    public async Task<List<Result>> GetStudentResultsAsync(int studentId)
    {
        return await _db.Results
            .Where(r => r.StudentId == studentId)
            .Include(r => r.Test).ThenInclude(t => t.Course)
            .OrderByDescending(r => r.CompletedAt)
            .ToListAsync();
    }

    public async Task<List<Result>> GetTestResultsAsync(int testId)
    {
        return await _db.Results
            .Where(r => r.TestId == testId)
            .Include(r => r.Student)
            .OrderByDescending(r => r.CompletedAt)
            .ToListAsync();
    }

    public async Task<bool> DeleteTestAsync(int testId)
    {
        var test = await _db.Tests.FindAsync(testId);
        if (test == null) return false;
        _db.Tests.Remove(test);
        await _db.SaveChangesAsync();
        return true;
    }

    private static TestDto MapToDto(Test t, bool includeAnswers) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        CourseId = t.CourseId,
        CourseName = t.Course?.Title ?? "",
        DurationMinutes = t.DurationMinutes,
        PassingScore = t.PassingScore,
        IsPublished = t.IsPublished,
        CreatedAt = t.CreatedAt,
        Questions = t.Questions?.Select(q => new QuestionDto
        {
            Id = q.Id,
            QuestionText = q.QuestionText,
            QuestionType = q.QuestionType.ToString(),
            Options = q.Options,
            CorrectAnswer = includeAnswers ? q.CorrectAnswer : null,
            Points = q.Points,
            OrderIndex = q.OrderIndex,
            ImageUrl = q.ImageUrl
        }).ToList() ?? new()
    };
}
