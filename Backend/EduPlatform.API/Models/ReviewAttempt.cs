using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduPlatform.API.Models;

public class ReviewAttempt
{
    public int Id { get; set; }

    public int ReviewQuizId { get; set; }
    public ReviewQuiz Quiz { get; set; } = null!;

    [Required, MaxLength(100)]
    public string StudentName { get; set; } = string.Empty;

    public int Score { get; set; }

    public int TotalQuestions { get; set; }

    public int DurationSeconds { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
