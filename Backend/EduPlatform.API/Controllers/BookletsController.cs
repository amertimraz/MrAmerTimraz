using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookletsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookletsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(bool all = false)
    {
        try
        {
            var query = _db.Booklets.AsQueryable();

            if (!all || !User.IsInRole("Admin"))
                query = query.Where(b => b.IsPublished);

            var booklets = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
            return Ok(booklets);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في استرجاع الملازم", details = msg });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var booklet = await _db.Booklets.FindAsync(id);
        if (booklet == null || (!booklet.IsPublished && !User.IsInRole("Admin")))
            return NotFound("الملزمة غير موجودة");

        return Ok(booklet);
    }

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(BookletDto dto)
    {
        try
        {
            var booklet = new Booklet
            {
                Title = dto.Title,
                Description = dto.Description,
                PdfUrl = dto.PdfUrl,
                CoverImageUrl = dto.CoverImageUrl,
                Subject = dto.Subject,
                GradeLevel = dto.GradeLevel,
                Price = dto.Price,
                IsPublished = dto.IsPublished,
                CreatedAt = DateTime.UtcNow
            };

            _db.Booklets.Add(booklet);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = booklet.Id }, booklet);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في حفظ الملزمة", details = msg });
        }
    }

    [HttpPut("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, BookletDto dto)
    {
        try
        {
            var booklet = await _db.Booklets.FindAsync(id);
            if (booklet == null) return NotFound("الملزمة غير موجودة");

            booklet.Title = dto.Title;
            booklet.Description = dto.Description;
            booklet.PdfUrl = dto.PdfUrl;
            booklet.CoverImageUrl = dto.CoverImageUrl;
            booklet.Subject = dto.Subject;
            booklet.GradeLevel = dto.GradeLevel;
            booklet.Price = dto.Price;
            booklet.IsPublished = dto.IsPublished;

            await _db.SaveChangesAsync();
            return Ok(booklet);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في تحديث الملزمة", details = msg });
        }
    }

    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var booklet = await _db.Booklets.FindAsync(id);
        if (booklet == null) return NotFound("الملزمة غير موجودة");

        _db.Booklets.Remove(booklet);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
