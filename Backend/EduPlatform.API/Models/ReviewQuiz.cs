using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduPlatform.API.Models;

public class ReviewQuiz
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public ReviewStage Stage { get; set; }

    [Column(TypeName = "boolean")]
    public bool IsActive { get; set; } = true;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ReviewQuestion> Questions { get; set; } = new List<ReviewQuestion>();
    public ICollection<ReviewAttempt> Attempts { get; set; } = new List<ReviewAttempt>();
}
