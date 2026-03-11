using EduPlatform.API.Data;
using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Services;

public interface INotificationService
{
    Task SendAsync(int userId, string title, string message, string? link = null);
    Task SendToAllAsync(string title, string message);
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

    public async Task SendToAllAsync(string title, string message)
    {
        var users = await _db.Users.Select(u => u.Id).ToListAsync();
        var notifications = users.Select(id => new Notification
        {
            UserId = id,
            Title = title,
            Message = message
        });
        _db.Notifications.AddRange(notifications);
        await _db.SaveChangesAsync();
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(int userId)
    {
        return await _db.Notifications
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
