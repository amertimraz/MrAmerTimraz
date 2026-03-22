using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class InteractiveQuizResult
{
    public int Id { get; set; }

    public int QuizId { get; set; }
    public InteractiveQuiz Quiz { get; set; } = null!;

    [Required, MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string PlayerName { get; set; } = string.Empty;

    public int Score { get; set; }
    public int CorrectCount { get; set; }
    public int TotalCount { get; set; }
    public double Percentage { get; set; }

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}
