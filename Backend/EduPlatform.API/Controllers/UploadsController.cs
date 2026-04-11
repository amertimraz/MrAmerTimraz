using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

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

    [HttpDelete("{folder}/{fileName}"), Authorize(Roles = "Admin,Teacher")]
    public IActionResult DeleteFile(string folder, string fileName)
    {
        try
        {
            // Security: prevent directory traversal
            if (fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
                return BadRequest("اسم ملف غير صالح");

            string[] allowedFolders = { "images", "pdfs", "videos" };
            if (!allowedFolders.Contains(folder))
                return BadRequest("مجلد غير مسموح");

            // Determine storage path (same logic as SaveFile)
            string root;
            string[] possiblePaths = {
                _env.WebRootPath,
                "/data/wwwroot",
                "/tmp/wwwroot",
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                Path.Combine(Path.GetTempPath(), "wwwroot")
            };
            
            root = possiblePaths.FirstOrDefault(p => !string.IsNullOrEmpty(p)) ?? possiblePaths[4];
            var filePath = Path.Combine(root, "uploads", folder, fileName);

            Console.WriteLine($"Attempting to delete: {filePath}");

            if (!System.IO.File.Exists(filePath))
                return NotFound("الملف غير موجود");

            System.IO.File.Delete(filePath);
            Console.WriteLine($"File deleted: {fileName}");

            return Ok(new { message = "تم حذف الملف بنجاح" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting file: {ex.Message}");
            return StatusCode(500, $"فشل في حذف الملف: {ex.Message}");
        }
    }

    [HttpGet("cleanup-incomplete"), Authorize(Roles = "Admin")]
    public IActionResult CleanupIncompleteFiles()
    {
        try
        {
            var deletedCount = 0;
            string[] folders = { "images", "pdfs", "videos" };
            string[] possiblePaths = {
                _env.WebRootPath,
                "/data/wwwroot",
                "/tmp/wwwroot",
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                Path.Combine(Path.GetTempPath(), "wwwroot")
            };
            
            var root = possiblePaths.FirstOrDefault(p => !string.IsNullOrEmpty(p)) ?? possiblePaths[4];

            foreach (var folder in folders)
            {
                var dir = Path.Combine(root, "uploads", folder);
                if (!Directory.Exists(dir)) continue;

                var files = Directory.GetFiles(dir);
                foreach (var file in files)
                {
                    try
                    {
                        var info = new FileInfo(file);
                        // Delete files that are 0 bytes (incomplete uploads) or older than 24 hours
                        if (info.Length == 0 || info.CreationTime < DateTime.Now.AddHours(-24))
                        {
                            System.IO.File.Delete(file);
                            deletedCount++;
                            Console.WriteLine($"Deleted incomplete/old file: {info.Name}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error checking file {file}: {ex.Message}");
                    }
                }
            }

            return Ok(new { message = $"تم حذف {deletedCount} ملف", deletedCount });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Cleanup error: {ex.Message}");
            return StatusCode(500, $"فشل في التنظيف: {ex.Message}");
        }
    }

    [HttpGet("all"), Authorize(Roles = "Admin")]
    public IActionResult GetAllFiles()
    {
        try
        {
            var allFiles = new List<FileInfoDto>();
            long totalSize = 0;
            string[] folders = { "images", "pdfs", "videos" };
            string[] possiblePaths = {
                _env.WebRootPath,
                "/data/wwwroot",
                "/tmp/wwwroot",
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                Path.Combine(Path.GetTempPath(), "wwwroot")
            };
            
            var root = possiblePaths.FirstOrDefault(p => !string.IsNullOrEmpty(p)) ?? possiblePaths[4];

            foreach (var folder in folders)
            {
                var dir = Path.Combine(root, "uploads", folder);
                if (!Directory.Exists(dir)) continue;

                var files = Directory.GetFiles(dir);
                foreach (var file in files)
                {
                    try
                    {
                        var info = new FileInfo(file);
                        allFiles.Add(new FileInfoDto
                        {
                            FileName = info.Name,
                            Folder = folder,
                            Size = info.Length,
                            SizeFormatted = FormatBytes(info.Length),
                            CreatedAt = info.CreationTime,
                            Url = $"/uploads/{folder}/{info.Name}",
                            IsComplete = info.Length > 0
                        });
                        totalSize += info.Length;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error reading file {file}: {ex.Message}");
                    }
                }
            }

            return Ok(new { 
                files = allFiles.OrderByDescending(f => f.CreatedAt).ToList(), 
                totalCount = allFiles.Count,
                totalSize = totalSize,
                totalSizeFormatted = FormatBytes(totalSize)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetAllFiles error: {ex.Message}");
            return StatusCode(500, $"فشل في جلب الملفات: {ex.Message}");
        }
    }

    private static string FormatBytes(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        int order = 0;
        double size = bytes;
        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }
        return $"{size:0.##} {sizes[order]}";
    }

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

            // Determine storage path - try multiple options for Railway compatibility
            string root;
            string[] possiblePaths = {
                _env.WebRootPath,
                "/data/wwwroot",
                "/tmp/wwwroot",
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                Path.Combine(Path.GetTempPath(), "wwwroot")
            };
            
            root = possiblePaths.FirstOrDefault(p => !string.IsNullOrEmpty(p)) ?? possiblePaths[4];
            
            Console.WriteLine($"Using storage root: {root}");
            
            var dir = Path.Combine(root, "uploads", folder);
            
            // Ensure directory exists
            try
            {
                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                    Console.WriteLine($"Created directory: {dir}");
                }
            }
            catch (Exception dirEx)
            {
                Console.WriteLine($"Failed to create directory {dir}: {dirEx.Message}");
                // Fallback to temp directory
                dir = Path.Combine(Path.GetTempPath(), "uploads", folder);
                Directory.CreateDirectory(dir);
                Console.WriteLine($"Using fallback directory: {dir}");
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

public class FileInfoDto
{
    public string FileName { get; set; } = string.Empty;
    public string Folder { get; set; } = string.Empty;
    public long Size { get; set; }
    public string SizeFormatted { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsComplete { get; set; }
}
