using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public enum IQType { MCQ, TrueFalse }

public class InteractiveQuestion
{
    public int Id { get; set; }

    public int QuizId { get; set; }
    public InteractiveQuiz Quiz { get; set; } = null!;

    [Required]
    public string Text { get; set; } = string.Empty;

    public IQType Type { get; set; } = IQType.MCQ;

    public string? Options { get; set; }

    public string? CorrectAnswer { get; set; }

    public string? Explanation { get; set; }

    public int OrderIndex { get; set; }
}
