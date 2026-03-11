using EduPlatform.API.Data;
using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Services;

public class CreateVideoDto
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Url { get; set; } = string.Empty;
    public VideoSource Source { get; set; } = VideoSource.YouTube;
    public int DurationSeconds { get; set; }
    public int OrderIndex { get; set; }
    public string? PdfUrl { get; set; }
}

public interface IVideoService
{
    Task<List<Video>> GetByCourseAsync(int courseId);
    Task<Video?> GetByIdAsync(int id);
    Task<Video> CreateAsync(CreateVideoDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> UpdateAsync(int id, CreateVideoDto dto);
}

public class VideoService : IVideoService
{
    private readonly AppDbContext _db;

    public VideoService(AppDbContext db) => _db = db;

    public async Task<List<Video>> GetByCourseAsync(int courseId)
    {
        return await _db.Videos
            .Where(v => v.CourseId == courseId)
            .OrderBy(v => v.OrderIndex)
            .ToListAsync();
    }

    public async Task<Video?> GetByIdAsync(int id) => await _db.Videos.FindAsync(id);

    public async Task<Video> CreateAsync(CreateVideoDto dto)
    {
        var video = new Video
        {
            CourseId = dto.CourseId,
            Title = dto.Title,
            Description = dto.Description,
            Url = dto.Url,
            Source = dto.Source,
            DurationSeconds = dto.DurationSeconds,
            OrderIndex = dto.OrderIndex,
            PdfUrl = dto.PdfUrl
        };

        _db.Videos.Add(video);
        await _db.SaveChangesAsync();
        return video;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var video = await _db.Videos.FindAsync(id);
        if (video == null) return false;
        _db.Videos.Remove(video);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateAsync(int id, CreateVideoDto dto)
    {
        var video = await _db.Videos.FindAsync(id);
        if (video == null) return false;

        video.Title = dto.Title;
        video.Description = dto.Description;
        video.Url = dto.Url;
        video.Source = dto.Source;
        video.DurationSeconds = dto.DurationSeconds;
        video.OrderIndex = dto.OrderIndex;
        video.PdfUrl = dto.PdfUrl;

        await _db.SaveChangesAsync();
        return true;
    }
}
