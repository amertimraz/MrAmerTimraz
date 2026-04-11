using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    private static readonly string[] AllowedImages = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
    private static readonly string[] AllowedPdfs   = [".pdf"];
    private static readonly string[] AllowedVideos  = [".mp4", ".webm", ".mkv", ".avi", ".mov"];

    private const long MaxImageSize = 10 * 1024 * 1024;
    private const long MaxPdfSize   = 50 * 1024 * 1024;
    private const long MaxVideoSize  = 500 * 1024 * 1024;

    public UploadsController(IWebHostEnvironment env) => _env = env;

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
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("لم يتم اختيار ملف");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest($"نوع الملف غير مدعوم. الأنواع المسموحة: {string.Join(", ", allowed)}");

            if (file.Length > maxSize)
                return BadRequest($"حجم الملف كبير جداً. الحد الأقصى: {maxSize / 1024 / 1024} MB");

            // Use persistent storage path for Railway
            var root = _env.WebRootPath;
            if (string.IsNullOrEmpty(root))
            {
                // Try to use /data for Railway persistent storage, fallback to current directory
                root = "/data/wwwroot";
                if (!Directory.Exists("/data"))
                {
                    root = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }
            }
            
            var dir = Path.Combine(root, "uploads", folder);
            
            // Ensure directory exists with proper permissions
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
                Console.WriteLine($"Created directory: {dir}");
            }

            var fileName = $"{Guid.NewGuid()}{ext}";
            var path = Path.Combine(dir, fileName);

            Console.WriteLine($"Saving file to: {path}");
            
            await using var stream = System.IO.File.Create(path);
            await file.CopyToAsync(stream);
            
            Console.WriteLine($"File saved successfully: {fileName} ({file.Length} bytes)");

            var url = $"/uploads/{folder}/{fileName}";
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving file: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"فشل في حفظ الملف: {ex.Message}");
        }
    }
}
