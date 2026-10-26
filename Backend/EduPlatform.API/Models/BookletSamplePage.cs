using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduPlatform.API.Models;

/// <summary>A watermarked sample image of one booklet page (the original PDF is never exposed).</summary>
public class BookletSamplePage
{
    public int Id { get; set; }

    public int BookletId { get; set; }
    public Booklet? Booklet { get; set; }

    public int PageNumber { get; set; }

    [Required, MaxLength(300)]
    public string ImageUrl { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
