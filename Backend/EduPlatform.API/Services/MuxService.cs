using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace EduPlatform.API.Services;

public interface IMuxService
{
    Task<string?> UploadVideoAsync(string videoUrl, string? title = null, string? thumbnailUrl = null);
    Task<bool> DeleteVideoAsync(string playbackId);
    Task<DirectUploadResponse?> CreateDirectUploadAsync(string? title = null, string? thumbnailUrl = null);
    Task<string?> GetPlaybackIdAsync(string assetId);
}

public class DirectUploadResponse
{
    public string UploadUrl { get; set; } = string.Empty;
    public string AssetId { get; set; } = string.Empty;
}

public class MuxService : IMuxService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public MuxService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        
        var tokenId = _configuration["Mux:TokenId"];
        var tokenSecret = _configuration["Mux:TokenSecret"];
        
        var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{tokenId}:{tokenSecret}"));
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);
        _httpClient.BaseAddress = new Uri("https://api.mux.com");
    }

    public async Task<string?> UploadVideoAsync(string videoUrl, string? title = null, string? thumbnailUrl = null)
    {
        try
        {
            var createAssetRequest = new
            {
                input = new[]
                {
                    new
                    {
                        url = videoUrl,
                        start_time = 0
                    }
                },
                playback_policy = "public",
                mp4_support = "standard",
                test = false
            };

            var content = new StringContent(
                JsonSerializer.Serialize(createAssetRequest),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync("/video/v1/assets", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Mux API Error: {error}");
                return null;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var assetData = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            var playbackId = assetData.GetProperty("playback_ids")[0].GetProperty("id").GetString();
            return playbackId;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Mux Upload Error: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteVideoAsync(string playbackId)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"/video/v1/assets/{playbackId}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<DirectUploadResponse?> CreateDirectUploadAsync(string? title = null, string? thumbnailUrl = null)
    {
        try
        {
            var createUploadRequest = new
            {
                timeout = 3600,
                cors_origin = "*",
                new_asset_settings = new
                {
                    playback_policy = new[] { "public" },
                    mp4_support = "standard",
                    test = false
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(createUploadRequest),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync("/video/v1/uploads", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Mux Direct Upload Error: {error}");
                return null;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var uploadData = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            var uploadUrl = uploadData.GetProperty("url").GetString();
            var assetId = uploadData.GetProperty("asset_id").GetString();
            
            return new DirectUploadResponse
            {
                UploadUrl = uploadUrl ?? string.Empty,
                AssetId = assetId ?? string.Empty
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Mux Direct Upload Exception: {ex.Message}");
            return null;
        }
    }

    public async Task<string?> GetPlaybackIdAsync(string assetId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/video/v1/assets/{assetId}");
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Mux Get Asset Error: {error}");
                return null;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var assetData = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            // Check if asset is ready
            var status = assetData.GetProperty("status").GetString();
            if (status != "ready")
                return null;
            
            var playbackIds = assetData.GetProperty("playback_ids");
            if (playbackIds.GetArrayLength() > 0)
            {
                return playbackIds[0].GetProperty("id").GetString();
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Mux Get Playback Error: {ex.Message}");
            return null;
        }
    }
}
