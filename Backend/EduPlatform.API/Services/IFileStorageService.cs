namespace EduPlatform.API.Services;

public interface IFileStorageService
{
    /// <summary>
    /// Upload a file and return the public URL.
    /// </summary>
    Task<string> UploadAsync(Stream stream, string fileName, string folder);

    /// <summary>
    /// Delete a file by its public ID (extracted from the URL).
    /// </summary>
    Task DeleteAsync(string url);
}
