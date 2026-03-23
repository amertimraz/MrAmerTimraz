using EduPlatform.API.Data;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LiveSessionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public LiveSessionsController(AppDbContext db) => _db = db;

    // Students & Public: List active sessions without JoinUrl
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveSessions()
    {
        var sessions = await _db.LiveSessions
            .Where(s => s.IsActive && s.ScheduledAt > DateTime.UtcNow.AddHours(-2)) // Still show recently started sessions
            .OrderBy(s => s.ScheduledAt)
            .Select(s => new {
                s.Id,
                s.Title,
                s.Description,
                s.ScheduledAt,
                s.Price,
                s.CreatedAt
            })
            .ToListAsync();
            
        return Ok(sessions);
    }

    // Students: Get single session details + JoinUrl if enrolled
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSessionDetails(int id)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = User.IsInRole("Admin");

        var session = await _db.LiveSessions.FindAsync(id);
        if (session == null) return NotFound();

        var isEnrolled = await _db.LiveSessionEnrollments
            .AnyAsync(e => e.LiveSessionId == id && e.StudentId == studentId);

        return Ok(new
        {
            session.Id,
            session.Title,
            session.Description,
            session.ScheduledAt,
            session.Price,
            JoinUrl = (isEnrolled || isAdmin) ? session.JoinUrl : null,
            IsEnrolled = isEnrolled
        });
    }

    // Admin: List all sessions
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllSessions()
    {
        return Ok(await _db.LiveSessions
            .OrderByDescending(s => s.ScheduledAt)
            .ToListAsync());
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateLiveSessionDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        try {
            var session = new LiveSession
            {
                Title = dto.Title,
                Description = dto.Description,
                ScheduledAt = DateTime.SpecifyKind(dto.ScheduledAt, DateTimeKind.Utc),
                JoinUrl = dto.JoinUrl,
                Price = dto.Price,
                IsActive = true
            };
            
            _db.LiveSessions.Add(session);
            await _db.SaveChangesAsync();
            return Ok(session);
        } catch (Exception ex) {
            return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateLiveSessionDto dto)
    {
        var session = await _db.LiveSessions.FindAsync(id);
        if (session == null) return NotFound();

        session.Title = dto.Title;
        session.Description = dto.Description;
        session.ScheduledAt = DateTime.SpecifyKind(dto.ScheduledAt, DateTimeKind.Utc);
        session.JoinUrl = dto.JoinUrl;
        session.Price = dto.Price;

        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateConcurrencyException) {
            if (!await _db.LiveSessions.AnyAsync(s => s.Id == id)) return NotFound();
            throw;
        }
        
        return NoContent();
    }
}

public class CreateLiveSessionDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string JoinUrl { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
    // Admin: Delete session
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var session = await _db.LiveSessions.FindAsync(id);
        if (session == null) return NotFound();

        _db.LiveSessions.Remove(session);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
