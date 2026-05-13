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
    public string? PdfFilename { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string Slug { get; set; } = string.Empty;
}

public class CommentDto
{
    public string Content { get; set; } = string.Empty;
    public int? ParentId { get; set; }
}

public class ReactionDto
{
    public ReactionType Type { get; set; }
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
    Task<VideoComment> AddCommentAsync(int videoId, int userId, string content, int? parentId = null);
    Task<bool> DeleteCommentAsync(int commentId);
    Task ToggleReactionAsync(int commentId, int userId, ReactionType type);
}

public class VideoService : IVideoService
{
    private readonly AppDbContext _db;

    public VideoService(AppDbContext db) => _db = db;

    public async Task<List<Video>> GetByCourseAsync(int courseId)
    {
        try
        {
            return await _db.Videos
                .AsNoTracking()
                .Where(v => v.CourseId == courseId)
                .OrderBy(v => v.OrderIndex)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            // Fallback: return empty list if schema is not updated
            return new List<Video>();
        }
    }

    public async Task<Video?> GetByIdAsync(int id) => 
        await _db.Videos.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id);

    public async Task<Video> CreateAsync(CreateVideoDto dto)
    {
        try
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
                PdfFilename = dto.PdfFilename,
                ThumbnailUrl = dto.ThumbnailUrl,
                Slug = dto.Slug
            };

            _db.Videos.Add(video);
            await _db.SaveChangesAsync();
            return video;
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message?.Contains("column") == true && 
                                             ex.InnerException?.Message?.Contains("does not exist") == true)
        {
            // Clear the failed entry from tracking
            var entries = _db.ChangeTracker.Entries().ToList();
            foreach (var entry in entries)
            {
                entry.State = EntityState.Detached;
            }
            
            // Execute raw SQL to add the columns if they don't exist
            try
            {
                await _db.Database.ExecuteSqlRawAsync("ALTER TABLE \"Videos\" ADD COLUMN IF NOT EXISTS \"PdfFilename\" TEXT");
                await _db.Database.ExecuteSqlRawAsync("ALTER TABLE \"Videos\" ADD COLUMN IF NOT EXISTS \"ThumbnailUrl\" TEXT");
                
                var videoRetry = new Video
                {
                    CourseId = dto.CourseId,
                    Title = dto.Title,
                    Description = dto.Description,
                    Url = dto.Url,
                    Source = dto.Source,
                    DurationSeconds = dto.DurationSeconds,
                    OrderIndex = dto.OrderIndex,
                    PdfUrl = dto.PdfUrl,
                    PdfFilename = dto.PdfFilename,
                    ThumbnailUrl = dto.ThumbnailUrl,
                    Slug = dto.Slug
                };

                _db.Videos.Add(videoRetry);
                await _db.SaveChangesAsync();
                return videoRetry;
            }
            catch
            {
                // Final fallback: create video without new fields
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
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task<Video?> GetBySlugAsync(string slug)
    {
        return await _db.Videos
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Slug == slug);
    }

    public async Task<List<VideoComment>> GetCommentsAsync(int videoId)
    {
        return await _db.VideoComments
            .AsNoTracking()
            .Include(c => c.Student)
            .Include(c => c.Reactions)
            .Include(c => c.Replies)
                .ThenInclude(r => r.Student)
            .Include(c => c.Replies)
                .ThenInclude(r => r.Reactions)
            .Where(c => c.VideoId == videoId && c.ParentId == null)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<VideoComment> AddCommentAsync(int videoId, int userId, string content, int? parentId = null)
    {
        var comment = new VideoComment
        {
            VideoId = videoId,
            StudentId = userId,
            Content = content,
            ParentId = parentId,
            CreatedAt = DateTime.UtcNow
        };

        _db.VideoComments.Add(comment);
        await _db.SaveChangesAsync();
        
        // Reload to include student info
        return await _db.VideoComments
            .Include(c => c.Student)
            .Include(c => c.Reactions)
            .FirstAsync(c => c.Id == comment.Id);
    }

    public async Task ToggleReactionAsync(int commentId, int userId, ReactionType type)
    {
        var existing = await _db.CommentReactions
            .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

        if (existing != null)
        {
            if (existing.Type == type)
            {
                _db.CommentReactions.Remove(existing);
            }
            else
            {
                existing.Type = type;
            }
        }
        else
        {
            _db.CommentReactions.Add(new CommentReaction
            {
                CommentId = commentId,
                UserId = userId,
                Type = type
            });
        }

        await _db.SaveChangesAsync();
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
        video.PdfFilename = dto.PdfFilename;
        video.ThumbnailUrl = dto.ThumbnailUrl;
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
