using System.ComponentModel.DataAnnotations;
using EduPlatform.API.Models;

namespace EduPlatform.API.DTOs;

public class CreateTestDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int CourseId { get; set; }

    public int DurationMinutes { get; set; } = 30;

    public int PassingScore { get; set; } = 60;
}

public class CreateQuestionDto
{
    [Required]
    public string QuestionText { get; set; } = string.Empty;

    public QuestionType QuestionType { get; set; } = QuestionType.MultipleChoice;

    public string? Options { get; set; }

    public string? CorrectAnswer { get; set; }

    public int Points { get; set; } = 1;

    public int OrderIndex { get; set; }

    public string? ImageUrl { get; set; }
}

public class TestDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int PassingScore { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}

public class QuestionDto
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? Options { get; set; }
    public string? CorrectAnswer { get; set; }
    public int Points { get; set; }
    public int OrderIndex { get; set; }
    public string? ImageUrl { get; set; }
}

public class SubmitTestDto
{
    public int TestId { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}

public class AnswerDto
{
    public int QuestionId { get; set; }
    public string Answer { get; set; } = string.Empty;
}

public class TestResultDto
{
    public int ResultId { get; set; }
    public float Score { get; set; }
    public float MaxScore { get; set; }
    public float Percentage { get; set; }
    public bool Passed { get; set; }
    public int PassingScore { get; set; }
    public DateTime CompletedAt { get; set; }
}
