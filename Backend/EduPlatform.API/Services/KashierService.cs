using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;

namespace EduPlatform.API.Services;

public interface IKashierService
{
    string GeneratePaymentUrl(int orderId, decimal amount, string studentName);
    bool VerifyPayment(string queryString);
}

public class KashierService : IKashierService
{
    private readonly IConfiguration _config;
    private readonly string _merchantId;
    private readonly string _apiKey;
    private readonly string _currency;
    private readonly bool _isLive;

    public KashierService(IConfiguration config)
    {
        _config = config;
        _merchantId = _config["Kashier:MerchantId"] ?? "";
        _apiKey = _config["Kashier:ApiKey"] ?? "";
        _currency = _config["Kashier:Currency"] ?? "EGP";
        _isLive = _config.GetValue<bool>("Kashier:IsLive");
    }

    public string GeneratePaymentUrl(int orderId, decimal amount, string studentName)
    {
        var baseUrl = _isLive ? "https://checkout.kashier.com" : "https://test-checkout.kashier.com";
        
        // Simplified Standard Checkout payload for redirection
        // Path: /?mid={mid}&orderId={orderId}&amount={amount}&currency={currency}&hash={hash}
        
        var hashData = $"/mid={_merchantId}&orderId={orderId}&amount={amount}&currency={_currency}&secret={_apiKey}";
        var hash = ComputeHmacSha256(hashData, _apiKey);

        var url = $"{baseUrl}/?mid={_merchantId}&orderId={orderId}&amount={amount}&currency={_currency}&hash={hash}&display=ar";
        
        return url;
    }

    public bool VerifyPayment(string queryString)
    {
        // Logic to verify callback hash from Kashier
        // Implementation depends on Kashier's specific callback payload
        return true; // Placeholder for now
    }

    private string ComputeHmacSha256(string data, string key)
    {
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
        {
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }
    }
}
