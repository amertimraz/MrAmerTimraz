using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FreeResourcesController : ControllerBase
{
    private readonly AppDbContext _db;

    public FreeResourcesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(bool all = false)
    {
        try
        {
            var query = _db.FreeResources.AsQueryable();

            if (!all || !User.IsInRole("Admin"))
                query = query.Where(r => r.IsPublished);

            var resources = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
            return Ok(resources);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في استرجاع الملفات المجانية", details = msg });
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var resource = await _db.FreeResources.FindAsync(id);
        if (resource == null || (!resource.IsPublished && !User.IsInRole("Admin")))
            return NotFound("الملف غير موجود");

        return Ok(resource);
    }

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(FreeResourceDto dto)
    {
        try
        {
            var resource = new FreeResource
            {
                Title = dto.Title,
                Description = dto.Description,
                FileUrl = dto.FileUrl,
                CoverImageUrl = dto.CoverImageUrl,
                IsPublished = dto.IsPublished,
                CreatedAt = DateTime.UtcNow
            };

            _db.FreeResources.Add(resource);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = resource.Id }, resource);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في حفظ الملف", details = msg });
        }
    }

    [HttpPut("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, FreeResourceDto dto)
    {
        try
        {
            var resource = await _db.FreeResources.FindAsync(id);
            if (resource == null) return NotFound("الملف غير موجود");

            resource.Title = dto.Title;
            resource.Description = dto.Description;
            resource.FileUrl = dto.FileUrl;
            resource.CoverImageUrl = dto.CoverImageUrl;
            resource.IsPublished = dto.IsPublished;

            await _db.SaveChangesAsync();
            return Ok(resource);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في تحديث الملف", details = msg });
        }
    }

    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var resource = await _db.FreeResources.FindAsync(id);
        if (resource == null) return NotFound("الملف غير موجود");

        _db.FreeResources.Remove(resource);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Free, unauthenticated, no-gate download — the whole point of this section.
    [HttpGet("{id}/download"), AllowAnonymous]
    public async Task<IActionResult> Download(int id)
    {
        var resource = await _db.FreeResources.FindAsync(id);
        if (resource == null || (!resource.IsPublished && !User.IsInRole("Admin")))
            return NotFound("الملف غير موجود");

        resource.DownloadCount++;
        await _db.SaveChangesAsync();

        if (resource.FileUrl.StartsWith("http"))
            return Redirect(resource.FileUrl);

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", resource.FileUrl.TrimStart('/'));
        if (!System.IO.File.Exists(filePath)) return NotFound("الملف غير موجود على السيرفر.");

        var ext = Path.GetExtension(filePath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            _ => "application/octet-stream"
        };

        return PhysicalFile(filePath, contentType, $"{resource.Title}{ext}");
    }
}
