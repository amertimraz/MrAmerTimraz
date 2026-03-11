using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class LibraryItem
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string FileUrl { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Category { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
