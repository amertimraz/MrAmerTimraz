using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace EduPlatform.API.Services;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageService()
    {
        var cloudinaryUrl = Environment.GetEnvironmentVariable("CLOUDINARY_URL");
        if (string.IsNullOrEmpty(cloudinaryUrl))
            throw new InvalidOperationException(
                "CLOUDINARY_URL environment variable is not set. " +
                "Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME");

        _cloudinary = new Cloudinary(cloudinaryUrl) { Api = { Secure = true } };
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string folder)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();

        // Determine resource type based on file extension
        var videoExts = new[] { ".mp4", ".webm", ".mkv", ".avi", ".mov" };
        var rawExts = new[] { ".pdf" };

        if (videoExts.Contains(ext))
        {
            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(fileName, stream),
                Folder = $"eduplatform/{folder}",
                PublicId = Path.GetFileNameWithoutExtension(fileName),
                Overwrite = false,
            };
            var result = await _cloudinary.UploadAsync(uploadParams);
            if (result.Error != null)
                throw new Exception($"Cloudinary upload failed: {result.Error.Message}");
            return result.SecureUrl.ToString();
        }
        else if (rawExts.Contains(ext))
        {
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(fileName, stream),
                Folder = $"eduplatform/{folder}",
                PublicId = Path.GetFileNameWithoutExtension(fileName),
                Overwrite = false,
            };
            var result = await _cloudinary.UploadAsync(uploadParams);
            if (result.Error != null)
                throw new Exception($"Cloudinary upload failed: {result.Error.Message}");
            return result.SecureUrl.ToString();
        }
        else
        {
            // Images
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, stream),
                Folder = $"eduplatform/{folder}",
                PublicId = Path.GetFileNameWithoutExtension(fileName),
                Overwrite = false,
            };
            var result = await _cloudinary.UploadAsync(uploadParams);
            if (result.Error != null)
                throw new Exception($"Cloudinary upload failed: {result.Error.Message}");
            return result.SecureUrl.ToString();
        }
    }

    public async Task DeleteAsync(string url)
    {
        if (string.IsNullOrEmpty(url) || !url.Contains("cloudinary"))
            return;

        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/CLOUD/image/upload/v123/folder/file.ext
        try
        {
            var uri = new Uri(url);
            var path = uri.AbsolutePath; // /image/upload/v123/folder/file.ext
            var uploadIdx = path.IndexOf("/upload/", StringComparison.Ordinal);
            if (uploadIdx < 0) return;

            var afterUpload = path[(uploadIdx + "/upload/".Length)..];
            // Skip version segment (v1234567890)
            if (afterUpload.StartsWith("v") && afterUpload.Contains('/'))
            {
                afterUpload = afterUpload[(afterUpload.IndexOf('/') + 1)..];
            }
            // Remove file extension to get the public ID
            var publicId = Path.ChangeExtension(afterUpload, null);

            // Determine resource type from URL path
            var resourceType = ResourceType.Image;
            if (path.Contains("/video/")) resourceType = ResourceType.Video;
            else if (path.Contains("/raw/")) resourceType = ResourceType.Raw;

            await _cloudinary.DestroyAsync(new DeletionParams(publicId)
            {
                ResourceType = resourceType,
            });
        }
        catch
        {
            // Best-effort deletion; don't fail the request
        }
    }
}
