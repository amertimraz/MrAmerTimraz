using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class LibraryStudentInfo
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string UserType { get; set; } = string.Empty; // student, parent, teacher

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Governorate { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? EducationLevel { get; set; } // primary, middle, secondary

    [Required, MaxLength(300)]
    public string NoteTitle { get; set; } = string.Empty;

    public int NoteId { get; set; }

    [Required, MaxLength(20)]
    public string Action { get; set; } = string.Empty; // view, download

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
