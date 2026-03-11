using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public string? Link { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
