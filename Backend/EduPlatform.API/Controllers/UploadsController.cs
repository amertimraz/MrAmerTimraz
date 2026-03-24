using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IFileStorageService _storage;

    private static readonly string[] AllowedImages = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
    private static readonly string[] AllowedPdfs   = [".pdf"];
    private static readonly string[] AllowedVideos  = [".mp4", ".webm", ".mkv", ".avi", ".mov"];

    private const long MaxImageSize = 10 * 1024 * 1024;
    private const long MaxPdfSize   = 50 * 1024 * 1024;
    private const long MaxVideoSize  = 500 * 1024 * 1024;

    public UploadsController(IFileStorageService storage) => _storage = storage;

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
        => await SaveFile(file, "images", AllowedImages, MaxImageSize);

    [HttpPost("pdf")]
    public async Task<IActionResult> UploadPdf(IFormFile file)
        => await SaveFile(file, "pdfs", AllowedPdfs, MaxPdfSize);

    [HttpPost("video")]
    public async Task<IActionResult> UploadVideo(IFormFile file)
        => await SaveFile(file, "videos", AllowedVideos, MaxVideoSize);

    private async Task<IActionResult> SaveFile(IFormFile? file, string folder, string[] allowed, long maxSize)
    {
        if (file == null || file.Length == 0)
            return BadRequest("لم يتم اختيار ملف");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return BadRequest($"نوع الملف غير مدعوم. الأنواع المسموحة: {string.Join(", ", allowed)}");

        if (file.Length > maxSize)
            return BadRequest($"حجم الملف كبير جداً. الحد الأقصى: {maxSize / 1024 / 1024} MB");

        var fileName = $"{Guid.NewGuid()}{ext}";
        await using var stream = file.OpenReadStream();
        var url = await _storage.UploadAsync(stream, fileName, folder);

        return Ok(new { url });
    }
}
