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

    public string? Slug { get; set; }

    public string? TeacherName { get; set; }
    public string? TeacherImage { get; set; }
    public string? WhatsappUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public bool ShowSupportButton { get; set; } = true;
    public int ViewCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InteractiveQuestion> Questions { get; set; } = new List<InteractiveQuestion>();
}
