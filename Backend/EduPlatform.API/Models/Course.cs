using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class Course
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ThumbnailUrl { get; set; }

    public string? Category { get; set; }

    public bool IsPublished { get; set; } = false;

    public decimal Price { get; set; } = 0;

    public bool IsFree => Price <= 0;

    public int CreatedBy { get; set; }
    public User Teacher { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Video> Videos { get; set; } = new List<Video>();
    public ICollection<Test> Tests { get; set; } = new List<Test>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
