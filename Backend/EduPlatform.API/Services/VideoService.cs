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
    public string Slug { get; set; } = string.Empty;
}

public class CommentDto
{
    public string Content { get; set; } = string.Empty;
}

public interface IVideoService
{
    Task<List<Video>> GetByCourseAsync(int courseId);
    Task<Video?> GetByIdAsync(int id);
    Task<Video?> GetBySlugAsync(string slug);
    Task<Video> CreateAsync(CreateVideoDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> UpdateAsync(int id, CreateVideoDto dto);
    Task<List<VideoComment>> GetCommentsAsync(int videoId);
    Task<VideoComment> AddCommentAsync(int videoId, int userId, string content);
    Task<bool> DeleteCommentAsync(int commentId);
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
            PdfUrl = dto.PdfUrl,
            Slug = dto.Slug
        };

        _db.Videos.Add(video);
        await _db.SaveChangesAsync();
        return video;
    }

    public async Task<Video?> GetBySlugAsync(string slug)
    {
        return await _db.Videos
            .FirstOrDefaultAsync(v => v.Slug == slug);
    }

    public async Task<List<VideoComment>> GetCommentsAsync(int videoId)
    {
        return await _db.VideoComments
            .Include(c => c.Student)
            .Where(c => c.VideoId == videoId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<VideoComment> AddCommentAsync(int videoId, int userId, string content)
    {
        var comment = new VideoComment
        {
            VideoId = videoId,
            StudentId = userId,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        _db.VideoComments.Add(comment);
        await _db.SaveChangesAsync();
        
        // Reload to include student info
        return await _db.VideoComments
            .Include(c => c.Student)
            .FirstAsync(c => c.Id == comment.Id);
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
        video.Slug = dto.Slug;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCommentAsync(int commentId)
    {
        var comment = await _db.VideoComments.FindAsync(commentId);
        if (comment == null) return false;

        _db.VideoComments.Remove(comment);
        await _db.SaveChangesAsync();
        return true;
    }
}
