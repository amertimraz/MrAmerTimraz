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

    [MaxLength(50)]
    public string? Term { get; set; }

    [Column(TypeName = "numeric")]
    public decimal Price { get; set; } = 0;

    [Column(TypeName = "numeric")]
    public decimal? TeacherPrice { get; set; }

    [Column(TypeName = "boolean")]
    public bool IsPublished { get; set; } = false;

    public int? PageCount { get; set; }

    // Teachers' showcase: shown on /teachers only when this is true AND IsPublished is true.
    [Column(TypeName = "boolean")]
    public bool TeacherShowcase { get; set; } = false;

    [MaxLength(1000)]
    public string? TeacherSummary { get; set; }

    // Owner-uploaded sample PDF offered for download in the teachers section (not the full booklet).
    [MaxLength(300)]
    public string? TeacherSamplePdfUrl { get; set; }

    public ICollection<BookletQuantityOffer> QuantityOffers { get; set; } = new List<BookletQuantityOffer>();
    public ICollection<BookletSamplePage> SamplePages { get; set; } = new List<BookletSamplePage>();

    public int ViewCount { get; set; } = 0;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PaymentRequest> PaymentRequests { get; set; } = new List<PaymentRequest>();
}
