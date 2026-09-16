using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class ReviewQuestion
{
    public int Id { get; set; }

    public int ReviewQuizId { get; set; }
    public ReviewQuiz Quiz { get; set; } = null!;

    [Required]
    public string Text { get; set; } = string.Empty;

    // JSON-encoded string[] of options, e.g. ["اختيار أ", "اختيار ب", "اختيار ج", "اختيار د"]
    [Required]
    public string OptionsJson { get; set; } = "[]";

    public int CorrectOptionIndex { get; set; }

    public int Order { get; set; }
}
