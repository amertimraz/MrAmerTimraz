using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public enum ReactionType { Like, Heart, Wow, Smile }

public class CommentReaction
{
    public int Id { get; set; }

    public int CommentId { get; set; }
    public VideoComment Comment { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public ReactionType Type { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
