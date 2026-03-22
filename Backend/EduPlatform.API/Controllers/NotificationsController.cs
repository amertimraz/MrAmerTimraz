using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notifications;
    private readonly IWebHostEnvironment _env;

    public NotificationsController(INotificationService notifications, IWebHostEnvironment env)
    {
        _notifications = notifications;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetMy()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _notifications.GetUserNotificationsAsync(userId));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(new { count = await _notifications.GetUnreadCountAsync(userId) });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await _notifications.MarkAsReadAsync(id, userId) ? NoContent() : NotFound();
    }

    [HttpPost("broadcast"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Broadcast([FromForm] SendNotificationDto dto)
    {
        string? imageUrl = null;
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            var ext = Path.GetExtension(dto.ImageFile.FileName).ToLowerInvariant();
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };
            if (allowed.Contains(ext))
            {
                var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var dir = Path.Combine(root, "uploads", "notifications");
                Directory.CreateDirectory(dir);

                var fileName = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(dir, fileName);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }
                imageUrl = $"/uploads/notifications/{fileName}";
            }
        }

        await _notifications.BroadcastAsync(dto, imageUrl);
        return Ok(new { message = "Notification sent." });
    }
}

public class SendNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    
    public IFormFile? ImageFile { get; set; }

    // "All", "Teachers", "Students", "Course", "SpecificUsers"
    public string TargetType { get; set; } = "All";
    
    [FromForm(Name = "TargetUserIds")]
    public string? TargetUserIdsJson { get; set; } // Since it's from form, we might send JSON array string "[1,2,3]"
    
    public int? TargetCourseId { get; set; }
}
