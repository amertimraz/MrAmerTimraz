using EduPlatform.API.Data;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

// Price = student price (shared with the student store); TeacherPrice = teacher version price.
public record UpdateTeacherBookletDto(bool TeacherShowcase, string? TeacherSummary, decimal? TeacherPrice, decimal? StudentPrice);

[ApiController]
public class TeacherBookletsController : ControllerBase
{
    private const int MaxSamples = 8;
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public TeacherBookletsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // ---------- Public ----------
    // Never returns PdfUrl: the full file must not be reachable from the teachers section.

    [HttpGet("api/teacher-booklets"), AllowAnonymous]
    public async Task<IActionResult> List([FromQuery] string? grade)
    {
        var q = _db.Booklets.AsNoTracking().Where(b => b.IsPublished && b.TeacherShowcase);
        if (!string.IsNullOrWhiteSpace(grade)) q = q.Where(b => b.GradeLevel == grade);

        var items = await q.OrderBy(b => b.GradeLevel).ThenBy(b => b.Title)
            .Select(b => new
            {
                b.Id, b.Title, b.GradeLevel, b.Subject, b.Term, b.PageCount, b.CoverImageUrl,
                StudentPrice = b.Price,
                b.TeacherPrice,
                // Card thumbnail: the first sample page, falling back to the cover image on the client.
                FirstSampleUrl = b.SamplePages.OrderBy(s => s.SortOrder).ThenBy(s => s.Id)
                    .Select(s => s.ImageUrl).FirstOrDefault(),
                HasSamples = b.SamplePages.Any(),
            }).ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("api/teacher-booklets/{id:int}"), AllowAnonymous]
    public async Task<IActionResult> Get(int id)
    {
        var b = await _db.Booklets.AsNoTracking()
            .Where(x => x.Id == id && x.IsPublished && x.TeacherShowcase)
            .Select(x => new
            {
                x.Id, x.Title, x.TeacherSummary, x.Description, x.GradeLevel, x.Subject, x.Term,
                x.PageCount, x.CoverImageUrl,
                StudentPrice = x.Price,
                x.TeacherPrice,
                SamplePdfUrl = x.TeacherSamplePdfUrl,
                Samples = x.SamplePages.OrderBy(s => s.SortOrder).ThenBy(s => s.Id)
                    .Select(s => new { s.Id, s.ImageUrl, s.SortOrder }).ToList(),
            }).FirstOrDefaultAsync();

        return b == null ? NotFound("المذكرة غير متاحة") : Ok(b);
    }

    // ---------- Admin ----------

    [HttpGet("api/admin/teacher-booklets"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminList()
    {
        var items = await _db.Booklets.AsNoTracking().OrderByDescending(b => b.Id)
            .Select(b => new
            {
                b.Id, b.Title, b.GradeLevel, b.Subject, b.IsPublished, b.TeacherShowcase, b.TeacherSummary,
                StudentPrice = b.Price,
                b.TeacherPrice, b.CoverImageUrl,
                SamplePdfUrl = b.TeacherSamplePdfUrl,
                FullPdfUrl = b.PdfUrl, // admin only: lets the owner open the full file
                Samples = b.SamplePages.OrderBy(s => s.SortOrder).Select(s => new { s.Id, s.ImageUrl, s.SortOrder }).ToList(),
            }).ToListAsync();
        return Ok(new { items });
    }

    [HttpPut("api/admin/teacher-booklets/{id:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeacherBookletDto dto)
    {
        var b = await _db.Booklets.FindAsync(id);
        if (b == null) return NotFound();
        if ((dto.TeacherSummary?.Length ?? 0) > 1000) return BadRequest("الملخص طويل (الحد 1000 حرف)");
        if (dto.TeacherPrice is < 0 || dto.StudentPrice is < 0) return BadRequest("السعر غير صالح");

        b.TeacherShowcase = dto.TeacherShowcase;
        b.TeacherSummary = dto.TeacherSummary;
        b.TeacherPrice = dto.TeacherPrice;
        if (dto.StudentPrice.HasValue) b.Price = dto.StudentPrice.Value;
        await _db.SaveChangesAsync();
        return Ok(new { b.Id, b.TeacherShowcase });
    }

    // Manual sample upload (watermarked images prepared by the owner). Automatic PDF rendering is a later task.
    [HttpPost("api/admin/teacher-booklets/{id:int}/samples/upload"), Authorize(Roles = "Admin")]
    [RequestSizeLimit(15_000_000)]
    public async Task<IActionResult> UploadSample(int id, IFormFile file, [FromForm] int pageNumber = 0)
    {
        var b = await _db.Booklets.Include(x => x.SamplePages).FirstOrDefaultAsync(x => x.Id == id);
        if (b == null) return NotFound();
        if (b.SamplePages.Count >= MaxSamples) return BadRequest($"الحد الأقصى {MaxSamples} صفحات عينة");
        if (file == null || file.Length == 0) return BadRequest("لم يتم اختيار ملف");
        if (file.Length > 10_000_000) return BadRequest("حجم الصورة أكبر من 10MB");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".png" or ".jpg" or ".jpeg" or ".webp")) return BadRequest("الصيغة المسموحة: png أو jpg أو webp");

        var dir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "samples", id.ToString());
        Directory.CreateDirectory(dir);
        var name = $"{Guid.NewGuid():N}{ext}";
        await using (var fs = System.IO.File.Create(Path.Combine(dir, name)))
            await file.CopyToAsync(fs);

        var sample = new BookletSamplePage
        {
            BookletId = id,
            PageNumber = pageNumber,
            ImageUrl = $"/uploads/samples/{id}/{name}",
            SortOrder = b.SamplePages.Count == 0 ? 1 : b.SamplePages.Max(s => s.SortOrder) + 1,
        };
        _db.BookletSamplePages.Add(sample);
        await _db.SaveChangesAsync();
        return Ok(new { sample.Id, sample.ImageUrl, sample.SortOrder });
    }

    // Owner-uploaded sample PDF (any page count; the owner prepares it). Public download link only for this file.
    [HttpPost("api/admin/teacher-booklets/{id:int}/sample-pdf"), Authorize(Roles = "Admin")]
    [RequestSizeLimit(60_000_000)]
    public async Task<IActionResult> UploadSamplePdf(int id, IFormFile file)
    {
        var b = await _db.Booklets.FindAsync(id);
        if (b == null) return NotFound();
        if (file == null || file.Length == 0) return BadRequest("لم يتم اختيار ملف");
        if (file.Length > 50_000_000) return BadRequest("حجم الملف أكبر من 50MB");
        if (!string.Equals(Path.GetExtension(file.FileName), ".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest("الملف يجب أن يكون PDF");

        // Check the PDF signature so a renamed file is rejected.
        var head = new byte[5];
        await using (var peek = file.OpenReadStream())
        {
            var read = await peek.ReadAsync(head.AsMemory(0, 5));
            if (read < 5 || System.Text.Encoding.ASCII.GetString(head) != "%PDF-") return BadRequest("الملف ليس PDF صالحاً");
        }

        var dir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "teacher-samples", id.ToString());
        Directory.CreateDirectory(dir);
        var name = $"{Guid.NewGuid():N}.pdf";
        await using (var fs = System.IO.File.Create(Path.Combine(dir, name)))
            await file.CopyToAsync(fs);

        DeleteSamplePdfFile(b.TeacherSamplePdfUrl);
        b.TeacherSamplePdfUrl = $"/uploads/teacher-samples/{id}/{name}";
        await _db.SaveChangesAsync();
        return Ok(new { SamplePdfUrl = b.TeacherSamplePdfUrl });
    }

    [HttpDelete("api/admin/teacher-booklets/{id:int}/sample-pdf"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSamplePdf(int id)
    {
        var b = await _db.Booklets.FindAsync(id);
        if (b == null) return NotFound();
        DeleteSamplePdfFile(b.TeacherSamplePdfUrl);
        b.TeacherSamplePdfUrl = null;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private void DeleteSamplePdfFile(string? url)
    {
        if (string.IsNullOrEmpty(url) || !url.StartsWith("/uploads/teacher-samples/")) return;
        var path = Path.Combine(_env.WebRootPath ?? "wwwroot", url.TrimStart('/'));
        if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
    }

    [HttpDelete("api/admin/teacher-booklets/{id:int}/samples/{sampleId:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSample(int id, int sampleId)
    {
        var s = await _db.BookletSamplePages.FirstOrDefaultAsync(x => x.Id == sampleId && x.BookletId == id);
        if (s == null) return NotFound();

        var path = Path.Combine(_env.WebRootPath ?? "wwwroot", s.ImageUrl.TrimStart('/'));
        if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
        _db.BookletSamplePages.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
