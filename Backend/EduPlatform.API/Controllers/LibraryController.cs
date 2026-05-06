using EduPlatform.API.Data;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LibraryController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public LibraryController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category = null)
    {
        var query = _db.LibraryItems.AsQueryable();
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(i => i.Category == category);
        var items = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _db.LibraryItems.FindAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] LibraryItemDto dto)
    {
        var item = new LibraryItem
        {
            Title = dto.Title,
            Description = dto.Description,
            FileUrl = dto.FileUrl,
            Category = dto.Category,
            ThumbnailUrl = dto.ThumbnailUrl,
            QuizUrl = dto.QuizUrl,
        };
        _db.LibraryItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] LibraryItemDto dto)
    {
        var item = await _db.LibraryItems.FindAsync(id);
        if (item == null) return NotFound();

        item.Title = dto.Title;
        item.Description = dto.Description;
        item.FileUrl = dto.FileUrl;
        item.Category = dto.Category;
        item.ThumbnailUrl = dto.ThumbnailUrl;
        item.QuizUrl = dto.QuizUrl;

        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.LibraryItems.FindAsync(id);
        if (item == null) return NotFound();

        foreach (var url in new[] { item.FileUrl, item.ThumbnailUrl })
        {
            if (!string.IsNullOrEmpty(url) && url.StartsWith("/uploads/"))
            {
                var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var filePath = Path.Combine(root, url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }
        }

        _db.LibraryItems.Remove(item);
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("{id}/view")]
    public async Task<IActionResult> IncrementView(int id)
    {
        var item = await _db.LibraryItems.FindAsync(id);
        if (item == null) return NotFound();
        item.ViewCount++;
        await _db.SaveChangesAsync();
        return Ok(new { viewCount = item.ViewCount });
    }

    [HttpPost("{id}/download")]
    public async Task<IActionResult> IncrementDownload(int id)
    {
        var item = await _db.LibraryItems.FindAsync(id);
        if (item == null) return NotFound();
        item.DownloadCount++;
        await _db.SaveChangesAsync();
        return Ok(new { downloadCount = item.DownloadCount });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var cats = await _db.LibraryItems
            .Where(i => i.Category != null)
            .Select(i => i.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
        return Ok(cats);
    }

    [HttpPost("student-info")]
    public async Task<IActionResult> SubmitStudentInfo([FromBody] LibraryStudentInfoDto dto)
    {
        var info = new LibraryStudentInfo
        {
            Name = dto.Name,
            UserType = dto.UserType,
            Phone = dto.Phone,
            Governorate = dto.Governorate,
            EducationLevel = dto.EducationLevel,
            NoteTitle = dto.NoteTitle,
            NoteId = dto.NoteId,
            Action = dto.Action,
        };
        _db.LibraryStudentInfos.Add(info);
        await _db.SaveChangesAsync();
        return Ok(new { id = info.Id, message = "تم تسجيل البيانات بنجاح" });
    }

    [HttpGet("student-info")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStudentInfos()
    {
        try
        {
            var infos = await _db.LibraryStudentInfos
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
            return Ok(infos);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] GetStudentInfos failed: {ex.Message}");
            // Return empty list if column mismatch (database not yet migrated)
            return Ok(new List<LibraryStudentInfo>());
        }
    }

    // Check if student info is required before download/view
    [HttpGet("require-info")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRequireInfo()
    {
        var setting = await _db.AppSettings
            .FirstOrDefaultAsync(s => s.Key == "Library_RequireStudentInfo");
        // Temporarily default to FALSE until EducationLevel DB column is fixed
        var require = setting?.Value == "true"; // default: false
        return Ok(new { require });
    }

    // Toggle require-student-info (Admin only)
    [HttpPost("require-info")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetRequireInfo([FromBody] RequireInfoDto dto)
    {
        var setting = await _db.AppSettings
            .FirstOrDefaultAsync(s => s.Key == "Library_RequireStudentInfo");
        if (setting == null)
        {
            setting = new AppSetting { Key = "Library_RequireStudentInfo", Value = dto.Require ? "true" : "false" };
            _db.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = dto.Require ? "true" : "false";
            setting.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();
        return Ok(new { require = dto.Require });
    }
}

public class RequireInfoDto
{
    public bool Require { get; set; }
}

public class LibraryItemDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? QuizUrl { get; set; }
}

public class LibraryStudentInfoDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    [JsonPropertyName("userType")]
    public string UserType { get; set; } = string.Empty;
    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;
    [JsonPropertyName("governorate")]
    public string Governorate { get; set; } = string.Empty;
    [JsonPropertyName("educationLevel")]
    public string? EducationLevel { get; set; }
    [JsonPropertyName("noteTitle")]
    public string NoteTitle { get; set; } = string.Empty;
    [JsonPropertyName("noteId")]
    public int NoteId { get; set; }
    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;
}
