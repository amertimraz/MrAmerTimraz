using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.DTOs;

public class CreateCourseDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ThumbnailUrl { get; set; }

    public string? Category { get; set; }

    public decimal Price { get; set; } = 0;
}

public class UpdateCourseDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? ThumbnailUrl { get; set; }

    public string? Category { get; set; }

    public bool? IsPublished { get; set; }

    public decimal? Price { get; set; }
}

public class CourseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Category { get; set; }
    public bool IsPublished { get; set; }
    public decimal Price { get; set; }
    public bool IsFree { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public int TeacherId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int VideoCount { get; set; }
    public int TestCount { get; set; }
    public int EnrolledCount { get; set; }
}
