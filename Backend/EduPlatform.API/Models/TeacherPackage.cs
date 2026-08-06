using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduPlatform.API.Models;

public class TeacherPackage
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

    public string? SampleFileUrl { get; set; }

    [Column(TypeName = "numeric")]
    public decimal Price { get; set; }

    [Column(TypeName = "boolean")]
    public bool IsPublished { get; set; } = false;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
