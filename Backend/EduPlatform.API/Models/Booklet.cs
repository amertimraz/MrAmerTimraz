using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class Booklet
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string PdfUrl { get; set; } = string.Empty;

    public string? CoverImageUrl { get; set; }

    [MaxLength(100)]
    public string? Subject { get; set; }

    [MaxLength(50)]
    public string? GradeLevel { get; set; }

    public decimal Price { get; set; } = 0;

    public bool IsPublished { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PaymentRequest> PaymentRequests { get; set; } = new List<PaymentRequest>();
}
