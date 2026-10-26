using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduPlatform.API.Models;

public enum TeacherInquiryStatus { New, Contacted, Sold, Cancelled }

public class TeacherInquiry
{
    public int Id { get; set; }

    public int? BookletId { get; set; }
    public Booklet? Booklet { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(11)]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Governorate { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? GradeLevel { get; set; }

    [MaxLength(100)]
    public string? Subject { get; set; }

    public int Quantity { get; set; } = 1;

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public TeacherInquiryStatus Status { get; set; } = TeacherInquiryStatus.New;

    [MaxLength(1000)]
    public string? AdminNote { get; set; }

    [MaxLength(64)]
    public string? IpHash { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
