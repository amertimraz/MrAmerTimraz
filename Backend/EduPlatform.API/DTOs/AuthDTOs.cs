using System.ComponentModel.DataAnnotations;
using EduPlatform.API.Models;

namespace EduPlatform.API.DTOs;

public class RegisterDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Student;
}

public class LoginDto
{
    [Required]
    public string Identifier { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public string? StudentCode { get; set; }
    public string? Grade { get; set; }
    public string? School { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? LastActivity { get; set; }
}

public class UpdateProfileImageDto
{
    public string ImageUrl { get; set; } = string.Empty;
}

public class UpdateProfileDto
{
    public string? Email { get; set; }
    public string? Grade { get; set; }
    public string? School { get; set; }
    public DateTime? DateOfBirth { get; set; }
}

public class ProfileCompletionDto
{
    public int Percentage { get; set; }
    public List<ProfileCompletionItem> Items { get; set; } = new();
}

public class ProfileCompletionItem
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool IsComplete { get; set; }
    public int Weight { get; set; }
}
