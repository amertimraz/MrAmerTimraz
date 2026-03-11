namespace EduPlatform.API.Models;

public enum PaymentStatus { Pending, Approved, Rejected }

public class PaymentRequest
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public User Student { get; set; } = null!;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public string? ReceiptImageUrl { get; set; }

    public decimal AmountPaid { get; set; }

    public string? Notes { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public string? AdminNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }
}
