using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SettingsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("payment")]
    public async Task<IActionResult> GetPaymentSettings()
    {
        var settings = await _db.AppSettings
            .Where(s => s.Key.StartsWith("Payment_"))
            .ToListAsync();

        var dto = new PaymentSettingsDto
        {
            VodafoneCashNumber = GetSettingValue(settings, "Payment_VodafoneCash"),
            InstapayNumber = GetSettingValue(settings, "Payment_Instapay"),
            BankAccountNumber = GetSettingValue(settings, "Payment_BankAccount"),
            BankName = GetSettingValue(settings, "Payment_BankName"),
            BankAccountHolder = GetSettingValue(settings, "Payment_AccountHolder"),
            PaymentInstructions = GetSettingValue(settings, "Payment_Instructions")
        };

        return Ok(dto);
    }

    [HttpPut("payment"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePaymentSettings([FromBody] UpdatePaymentSettingsDto dto)
    {
        await UpdateSetting("Payment_VodafoneCash", dto.VodafoneCashNumber);
        await UpdateSetting("Payment_Instapay", dto.InstapayNumber);
        await UpdateSetting("Payment_BankAccount", dto.BankAccountNumber);
        await UpdateSetting("Payment_BankName", dto.BankName);
        await UpdateSetting("Payment_AccountHolder", dto.BankAccountHolder);
        await UpdateSetting("Payment_Instructions", dto.PaymentInstructions);

        await _db.SaveChangesAsync();
        return Ok(new { message = "تم تحديث إعدادات الدفع بنجاح" });
    }

    private static string GetSettingValue(List<AppSetting> settings, string key)
    {
        return settings.FirstOrDefault(s => s.Key == key)?.Value ?? string.Empty;
    }

    private async Task UpdateSetting(string key, string? value)
    {
        if (value == null) return;

        var setting = await _db.AppSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null)
        {
            setting = new AppSetting { Key = key, Value = value };
            _db.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
        }
    }
}
