using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public enum VideoSource { YouTube, Vimeo, Upload, Mux }

public class Video
{
    public int Id { get; set; }

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string Url { get; set; } = string.Empty;

    public VideoSource Source { get; set; } = VideoSource.YouTube;

    public int DurationSeconds { get; set; }

    public int OrderIndex { get; set; }

    public string? PdfUrl { get; set; }

    public string? PdfFilename { get; set; }

    public string? ThumbnailUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
