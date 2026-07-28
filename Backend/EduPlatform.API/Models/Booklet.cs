using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

    [Column(TypeName = "numeric")]
    public decimal Price { get; set; } = 0;

    [Column(TypeName = "numeric")]
    public decimal? TeacherPrice { get; set; }

    [Column(TypeName = "boolean")]
    public bool IsPublished { get; set; } = false;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PaymentRequest> PaymentRequests { get; set; } = new List<PaymentRequest>();
}
