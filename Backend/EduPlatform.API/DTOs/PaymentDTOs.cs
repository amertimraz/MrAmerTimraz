namespace EduPlatform.API.DTOs;

public class CreatePaymentRequestDto
{
    public int CourseId { get; set; }
    public decimal AmountPaid { get; set; }
    public string? Notes { get; set; }
}

public class ReviewPaymentDto
{
    public bool Approve { get; set; }
    public string? AdminNote { get; set; }
}

public class PaymentRequestDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentUsername { get; set; } = string.Empty;
    public string StudentPhone { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public decimal CoursePrice { get; set; }
    public decimal AmountPaid { get; set; }
    public string? ReceiptImageUrl { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
