using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class AppSetting
{
    public int Id { get; set; }
    
    [Required]
    public string Key { get; set; } = string.Empty;
    
    public string? Value { get; set; }
    
    public string? Description { get; set; }
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
