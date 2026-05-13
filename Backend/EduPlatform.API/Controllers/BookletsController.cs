using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using EduPlatform.API.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookletsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPaymentService _payments;

    public BookletsController(AppDbContext db, IPaymentService payments)
    {
        _db = db;
        _payments = payments;
    }

    [HttpGet]
    [AllowAnonymous]
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
    [AllowAnonymous]
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

    [HttpGet("{id}/download"), AllowAnonymous]
    public async Task<IActionResult> Download(int id, [FromQuery] string? token)
    {
        var studentIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int? studentId = studentIdClaim != null ? int.Parse(studentIdClaim) : null;
        var isAdmin = User.IsInRole("Admin");

        var booklet = await _db.Booklets.FindAsync(id);
        if (booklet == null) return NotFound("الملزمة غير موجودة");

        if (!isAdmin)
        {
            if (booklet.Price > 0)
            {
                bool hasAccess = false;
                if (studentId.HasValue)
                {
                    hasAccess = await _payments.HasApprovedOnlyAsync(null, null, id, studentId.Value);
                }

                if (!hasAccess && !string.IsNullOrEmpty(token))
                {
                    hasAccess = await _db.PaymentRequests.AnyAsync(p => 
                        p.BookletId == id && p.DownloadToken == token && p.Status == PaymentStatus.Approved);
                }

                if (!hasAccess)
                    return Forbid("يجب شراء الملزمة أولاً للتمكن من تحميلها.");
            }
        }

        // If PdfUrl is a full external URL, redirect
        if (booklet.PdfUrl.StartsWith("http"))
            return Redirect(booklet.PdfUrl);

        // If PdfUrl is local, serve it
        // Assuming PdfUrl is like /uploads/booklets/abc.pdf
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", booklet.PdfUrl.TrimStart('/'));
        if (!System.IO.File.Exists(filePath)) return NotFound("ملف المذكرة غير موجود على السيرفر.");

        return PhysicalFile(filePath, "application/pdf", $"{booklet.Title}.pdf");
    }
}
