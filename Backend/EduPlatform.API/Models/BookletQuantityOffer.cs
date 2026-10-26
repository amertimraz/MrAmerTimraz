using System.ComponentModel.DataAnnotations.Schema;

namespace EduPlatform.API.Models;

/// <summary>Bulk price: from MinQuantity units upward, each costs UnitPrice.</summary>
public class BookletQuantityOffer
{
    public int Id { get; set; }

    public int BookletId { get; set; }
    public Booklet? Booklet { get; set; }

    public int MinQuantity { get; set; }

    [Column(TypeName = "numeric")]
    public decimal UnitPrice { get; set; }
}
