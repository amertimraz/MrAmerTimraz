using System.Security.Cryptography;
using System.Text;
using EduPlatform.API.Data;
using EduPlatform.API.Models;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

public record CreateTeacherInquiryDto(
    int? BookletId, string? Name, string? Phone, string? Governorate, string? GradeLevel,
    string? Subject, int Quantity, string? Notes, string? Website);

public record UpdateTeacherInquiryDto(string? Status, string? AdminNote);

[ApiController]
public class TeacherInquiriesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IInquiryNotifier _notifier;

    public TeacherInquiriesController(AppDbContext db, IInquiryNotifier notifier)
    {
        _db = db;
        _notifier = notifier;
    }

    [HttpPost("api/teacher-inquiries"), AllowAnonymous, EnableRateLimiting("inquiries")]
    public async Task<IActionResult> Create([FromBody] CreateTeacherInquiryDto dto)
    {
        // Honeypot: bots fill the hidden field; pretend success without saving.
        if (!string.IsNullOrWhiteSpace(dto.Website)) return Ok(new { id = 0 });

        var errors = new Dictionary<string, string>();
        var name = dto.Name?.Trim() ?? "";
        if (name.Length < 2 || name.Length > 100) errors["name"] = "اكتب اسمك (من حرفين إلى 100 حرف)";

        var phone = PhoneNormalizer.Normalize(dto.Phone);
        if (phone == null) errors["phone"] = "رقم الهاتف غير صالح (مثال: 01012345678)";

        var governorate = dto.Governorate?.Trim() ?? "";
        if (governorate.Length == 0 || governorate.Length > 50) errors["governorate"] = "اختر المحافظة";

        if (dto.Quantity < 1 || dto.Quantity > 5000) errors["quantity"] = "الكمية من 1 إلى 5000";
        if ((dto.Notes?.Length ?? 0) > 1000) errors["notes"] = "الملاحظات طويلة (الحد 1000 حرف)";
        if ((dto.GradeLevel?.Length ?? 0) > 50) errors["gradeLevel"] = "قيمة غير صالحة";
        if ((dto.Subject?.Length ?? 0) > 100) errors["subject"] = "قيمة غير صالحة";

        Booklet? booklet = null;
        if (dto.BookletId.HasValue)
        {
            booklet = await _db.Booklets.FirstOrDefaultAsync(b =>
                b.Id == dto.BookletId.Value && b.IsPublished && b.TeacherShowcase);
            if (booklet == null) errors["bookletId"] = "المذكرة غير متاحة";
        }

        if (errors.Count > 0) return BadRequest(new { errors });

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
        var inquiry = new TeacherInquiry
        {
            BookletId = booklet?.Id,
            Name = name,
            Phone = phone!,
            Governorate = governorate,
            GradeLevel = dto.GradeLevel?.Trim(),
            Subject = dto.Subject?.Trim(),
            Quantity = dto.Quantity,
            Notes = dto.Notes?.Trim(),
            IpHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes("teachers|" + ip))),
        };
        _db.TeacherInquiries.Add(inquiry);
        await _db.SaveChangesAsync();

        var bookletTitle = booklet?.Title;
        _ = Task.Run(() => _notifier.NotifyAsync(inquiry, bookletTitle));

        var waNumber = Environment.GetEnvironmentVariable("TEACHERS_WHATSAPP") ?? "201096066818";
        var text = $"السلام عليكم، أنا {name} من {governorate}. أريد عرض سعر " +
                   (bookletTitle != null ? $"لمذكرة «{bookletTitle}» " : "للمذكرات ") + $"بكمية {inquiry.Quantity}.";
        var whatsAppUrl = $"https://wa.me/{waNumber}?text={Uri.EscapeDataString(text)}";

        return StatusCode(201, new { id = inquiry.Id, whatsAppUrl });
    }

    // ---------- Admin ----------

    [HttpGet("api/admin/teacher-inquiries"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> List([FromQuery] string? status, [FromQuery] string? governorate,
        [FromQuery] int? bookletId, [FromQuery] int page = 1)
    {
        var q = _db.TeacherInquiries.AsNoTracking().AsQueryable();
        if (Enum.TryParse<TeacherInquiryStatus>(status, true, out var st)) q = q.Where(i => i.Status == st);
        if (!string.IsNullOrWhiteSpace(governorate)) q = q.Where(i => i.Governorate == governorate);
        if (bookletId.HasValue) q = q.Where(i => i.BookletId == bookletId);

        var total = await q.CountAsync();
        var newCount = await _db.TeacherInquiries.CountAsync(i => i.Status == TeacherInquiryStatus.New);
        var items = await q.OrderByDescending(i => i.CreatedAt)
            .Skip((Math.Max(page, 1) - 1) * 30).Take(30)
            .Select(i => new
            {
                i.Id, i.Name, i.Phone, i.Governorate, i.GradeLevel, i.Subject, i.Quantity, i.Notes,
                Status = i.Status.ToString(), i.AdminNote, i.CreatedAt, i.UpdatedAt,
                i.BookletId,
                BookletTitle = i.Booklet != null ? i.Booklet.Title : null,
            }).ToListAsync();

        return Ok(new { total, newCount, items });
    }

    [HttpPut("api/admin/teacher-inquiries/{id:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeacherInquiryDto dto)
    {
        var inquiry = await _db.TeacherInquiries.FindAsync(id);
        if (inquiry == null) return NotFound();

        if (dto.Status != null)
        {
            if (!Enum.TryParse<TeacherInquiryStatus>(dto.Status, true, out var st)) return BadRequest("حالة غير صالحة");
            inquiry.Status = st;
        }
        if (dto.AdminNote != null)
        {
            if (dto.AdminNote.Length > 1000) return BadRequest("الملاحظة طويلة (الحد 1000 حرف)");
            inquiry.AdminNote = dto.AdminNote;
        }
        inquiry.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { inquiry.Id, Status = inquiry.Status.ToString() });
    }
}
