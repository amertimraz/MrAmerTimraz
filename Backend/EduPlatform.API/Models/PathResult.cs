namespace EduPlatform.API.Models;

public class PathResult
{
    public int Id { get; set; }
    public string? StudentName { get; set; }
    public string TrackId { get; set; } = string.Empty; // life, engineering, business, arts
    public string TrackName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? SessionId { get; set; } // For anonymous tracking
}
