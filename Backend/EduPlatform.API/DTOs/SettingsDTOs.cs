namespace EduPlatform.API.DTOs;

public class PaymentSettingsDto
{
    public string VodafoneCashNumber { get; set; } = string.Empty;
    public string InstapayNumber { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string BankAccountHolder { get; set; } = string.Empty;
    public string PaymentInstructions { get; set; } = string.Empty;
}

public class UpdatePaymentSettingsDto
{
    public string? VodafoneCashNumber { get; set; }
    public string? InstapayNumber { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public string? BankAccountHolder { get; set; }
    public string? PaymentInstructions { get; set; }
}
