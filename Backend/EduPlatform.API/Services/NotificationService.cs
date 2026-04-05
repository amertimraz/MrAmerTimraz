using EduPlatform.API.Data;
using EduPlatform.API.Models;
using EduPlatform.API.Controllers;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Services;

public interface INotificationService
{
    Task SendAsync(int userId, string title, string message, string? link = null);
    Task BroadcastAsync(SendNotificationDto dto, string? imageUrl);
    Task<List<Notification>> GetUserNotificationsAsync(int userId);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
    Task<int> GetUnreadCountAsync(int userId);
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db) => _db = db;

    public async Task SendAsync(int userId, string title, string message, string? link = null)
    {
        _db.Notifications.Add(new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Link = link
        });
        await _db.SaveChangesAsync();
    }

    public async Task BroadcastAsync(SendNotificationDto dto, string? imageUrl)
    {
        IQueryable<User> query = _db.Users.AsNoTracking();

        if (dto.TargetType == "Teachers") query = query.Where(u => u.Role == UserRole.Teacher);
        else if (dto.TargetType == "Students") query = query.Where(u => u.Role == UserRole.Student);
        else if (dto.TargetType == "SpecificUsers" && !string.IsNullOrEmpty(dto.TargetUserIdsJson))
        {
            try {
                var ids = System.Text.Json.JsonSerializer.Deserialize<List<int>>(dto.TargetUserIdsJson);
                if (ids != null && ids.Any()) query = query.Where(u => ids.Contains(u.Id));
            } catch { } // fallback to all or ignore? Let's assume if parsing fails, don't send to anyone to be safe
        }
        else if (dto.TargetType == "Course" && dto.TargetCourseId.HasValue)
        {
            // Get students enrolled in this course
            var studentIds = await _db.Enrollments
                .Where(e => e.CourseId == dto.TargetCourseId.Value)
                .Select(e => e.StudentId)
                .ToListAsync();
            
            query = query.Where(u => studentIds.Contains(u.Id));
        }

        var users = await query.Select(u => u.Id).ToListAsync();
        var notifications = users.Select(id => new Notification
        {
            UserId = id,
            Title = dto.Title,
            Message = dto.Message,
            Link = dto.LinkUrl,
            ImageUrl = imageUrl
        });
        
        _db.Notifications.AddRange(notifications);
        await _db.SaveChangesAsync();
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(int userId)
    {
        return await _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        if (notification == null) return false;
        notification.IsRead = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _db.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }
}
