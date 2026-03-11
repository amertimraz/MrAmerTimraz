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

    public NotificationsController(INotificationService notifications) => _notifications = notifications;

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
    public async Task<IActionResult> Broadcast([FromBody] BroadcastDto dto)
    {
        await _notifications.SendToAllAsync(dto.Title, dto.Message);
        return Ok(new { message = "Notification sent to all users" });
    }
}

public class BroadcastDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
