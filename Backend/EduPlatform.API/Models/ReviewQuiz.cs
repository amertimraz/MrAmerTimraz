using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class ReviewQuiz
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public ReviewStage Stage { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ReviewQuestion> Questions { get; set; } = new List<ReviewQuestion>();
    public ICollection<ReviewAttempt> Attempts { get; set; } = new List<ReviewAttempt>();
}
