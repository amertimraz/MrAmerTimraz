using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class InteractiveQuiz
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    public string? Subject { get; set; }

    public string? Grade { get; set; }

    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InteractiveQuestion> Questions { get; set; } = new List<InteractiveQuestion>();
}
