using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace EduPlatform.API.Models;

public enum QuestionType { TrueFalse, MultipleChoice, FillBlank, Ordering }

public class Question
{
    public int Id { get; set; }

    public int TestId { get; set; }
    public Test Test { get; set; } = null!;

    [Required]
    public string QuestionText { get; set; } = string.Empty;

    public QuestionType QuestionType { get; set; } = QuestionType.MultipleChoice;

    public string? Options { get; set; }

    public string? CorrectAnswer { get; set; }

    public int Points { get; set; } = 1;

    public int OrderIndex { get; set; }

    public string? ImageUrl { get; set; }
}
