using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduPlatform.API.Data;
using EduPlatform.API.Models;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PathResultsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PathResultsController(AppDbContext db) => _db = db;

    /// <summary>
    /// Save a new path result when a student completes the guide
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePathResultDto dto)
    {
        try
        {
            // Ensure table exists before saving
            await _db.Database.EnsureCreatedAsync();
            
            var pathResult = new PathResult
            {
                StudentName = dto.StudentName,
                TrackId = dto.TrackId,
                TrackName = dto.TrackName,
                SessionId = dto.SessionId ?? Guid.NewGuid().ToString("N")[..16],
                CreatedAt = DateTime.UtcNow
            };

            _db.PathResults.Add(pathResult);
            await _db.SaveChangesAsync();

            return Ok(new { id = pathResult.Id, message = "تم حفظ النتيجة بنجاح" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Create path result failed: {ex.Message}");
            return StatusCode(500, new { message = "فشل في حفظ النتيجة", error = ex.Message });
        }
    }

    /// <summary>
    /// Get statistics for the path guide usage
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            // Ensure table exists
            await _db.Database.EnsureCreatedAsync();
            
            var totalUsers = await _db.PathResults.CountAsync();
            
            var trackDistribution = await _db.PathResults
                .GroupBy(p => new { p.TrackId, p.TrackName })
                .Select(g => new
                {
                    trackId = g.Key.TrackId,
                    trackName = g.Key.TrackName,
                    count = g.Count()
                })
                .ToListAsync();

            var todayCount = await _db.PathResults
                .CountAsync(p => p.CreatedAt.Date == DateTime.UtcNow.Date);

            var thisWeekCount = await _db.PathResults
                .CountAsync(p => p.CreatedAt >= DateTime.UtcNow.AddDays(-7));

            return Ok(new
            {
                totalUsers,
                todayCount,
                thisWeekCount,
                trackDistribution
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] GetStats failed: {ex.Message}");
            Console.WriteLine($"[ERROR] Stack: {ex.StackTrace}");
            
            // Return empty stats on error so frontend doesn't break
            return Ok(new
            {
                totalUsers = 0,
                todayCount = 0,
                thisWeekCount = 0,
                trackDistribution = new List<object>(),
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get all path results (for admin)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int limit = 100)
    {
        var results = await _db.PathResults
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit)
            .Select(p => new
            {
                p.Id,
                p.StudentName,
                p.TrackId,
                p.TrackName,
                p.CreatedAt
            })
            .ToListAsync();

        return Ok(results);
    }

    /// <summary>
    /// Get recent results for live stats
    /// </summary>
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int count = 5)
    {
        var results = await _db.PathResults
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .Select(p => new
            {
                p.StudentName,
                p.TrackName,
                p.CreatedAt
            })
            .ToListAsync();

        return Ok(results);
    }
}

public class CreatePathResultDto
{
    public string? StudentName { get; set; }
    public string TrackId { get; set; } = string.Empty;
    public string TrackName { get; set; } = string.Empty;
    public string? SessionId { get; set; }
}
