namespace EduPlatform.API.DTOs;

public class CreatePaymentRequestDto
{
    public int? CourseId { get; set; }
    public int? LiveSessionId { get; set; }
    public int? BookletId { get; set; }
    public decimal AmountPaid { get; set; }
    public string? Notes { get; set; }
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
}

public class BookletDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string PdfUrl { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? Subject { get; set; }
    public string? GradeLevel { get; set; }
    public string? Term { get; set; }
    public decimal Price { get; set; }
    public decimal? TeacherPrice { get; set; }
    public bool IsPublished { get; set; }
}

public class ReviewPaymentDto
{
    public bool Approve { get; set; }
    public string? AdminNote { get; set; }
}

public class PaymentRequestDto
{
    public int Id { get; set; }
    public int? StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentUsername { get; set; } = string.Empty;
    public string StudentPhone { get; set; } = string.Empty;
    
    public int? CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public decimal CoursePrice { get; set; }

    public int? LiveSessionId { get; set; }
    public string LiveSessionTitle { get; set; } = string.Empty;
    public decimal LiveSessionPrice { get; set; }

    public int? BookletId { get; set; }
    public string BookletTitle { get; set; } = string.Empty;
    public decimal BookletPrice { get; set; }

    public decimal AmountPaid { get; set; }
    public string? ReceiptImageUrl { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
    public string? DownloadToken { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

public class BookletPurchaseStatsDto
{
    public int TotalPurchases { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<BookletPurchaseItemDto> RecentPurchases { get; set; } = new();
    public List<BookletSummaryDto> TopBooklets { get; set; } = new();
}

public class BookletPurchaseItemDto
{
    public int Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentUsername { get; set; } = string.Empty;
    public string BookletTitle { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; }
    public DateTime PurchaseDate { get; set; }
}

public class BookletSummaryDto
{
    public int BookletId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int PurchaseCount { get; set; }
    public decimal TotalRevenue { get; set; }
}
