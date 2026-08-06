namespace EduPlatform.API.DTOs;

public class TeacherPackageDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? SampleFileUrl { get; set; }
    public decimal Price { get; set; }
    public bool IsPublished { get; set; }
}
