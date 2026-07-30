using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduPlatform.API.Models;

public class FreeResource
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string FileUrl { get; set; } = string.Empty;

    public string? CoverImageUrl { get; set; }

    [Column(TypeName = "boolean")]
    public bool IsPublished { get; set; } = false;

    public int DownloadCount { get; set; } = 0;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
