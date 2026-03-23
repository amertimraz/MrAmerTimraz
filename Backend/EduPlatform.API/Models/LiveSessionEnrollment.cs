using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class LiveSessionEnrollment
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public User Student { get; set; } = null!;

    public int LiveSessionId { get; set; }
    public LiveSession LiveSession { get; set; } = null!;

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
}
