using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public enum UserRole { Student, Teacher, Admin }

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Email { get; set; }

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public string? PlainPassword { get; set; }

    public UserRole Role { get; set; } = UserRole.Student;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    public string? ProfileImage { get; set; }

    public ICollection<Course> CreatedCourses { get; set; } = new List<Course>();
    public ICollection<Result> Results { get; set; } = new List<Result>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
