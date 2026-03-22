using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class VideoComment
{
    public int Id { get; set; }

    public int VideoId { get; set; }
    public Video Video { get; set; } = null!;

    [Required]
    public int StudentId { get; set; }
    public User Student { get; set; } = null!;

    [Required, MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
