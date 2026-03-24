using EduPlatform.API.Data;
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
        var query = _db.Booklets.AsQueryable();

        if (!all || !User.IsInRole("Admin"))
            query = query.Where(b => b.IsPublished);

        var booklets = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return Ok(booklets);
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
    public async Task<IActionResult> Create(Booklet booklet)
    {
        booklet.CreatedAt = DateTime.UtcNow;
        _db.Booklets.Add(booklet);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = booklet.Id }, booklet);
    }

    [HttpPut("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, Booklet bookletIn)
    {
        var booklet = await _db.Booklets.FindAsync(id);
        if (booklet == null) return NotFound("الملزمة غير موجودة");

        booklet.Title = bookletIn.Title;
        booklet.Description = bookletIn.Description;
        booklet.PdfUrl = bookletIn.PdfUrl;
        booklet.CoverImageUrl = bookletIn.CoverImageUrl;
        booklet.Subject = bookletIn.Subject;
        booklet.GradeLevel = bookletIn.GradeLevel;
        booklet.Price = bookletIn.Price;
        booklet.IsPublished = bookletIn.IsPublished;

        await _db.SaveChangesAsync();
        return Ok(booklet);
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
