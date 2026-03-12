using EduPlatform.API.Data;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
}

public class LibraryItemDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? ThumbnailUrl { get; set; }
}
