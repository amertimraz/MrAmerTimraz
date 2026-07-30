namespace EduPlatform.API.DTOs;

public class FreeResourceDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public bool IsPublished { get; set; }
}
