using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EduPlatform.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<List<UserDto>> GetAllUsersAsync();
    Task<bool> DeleteUserAsync(int id);
    Task<bool> UpdateUserAsync(int id, RegisterDto dto);
    Task<bool> UpdateLastLoginAsync(int id);
    Task<bool> UpdateLastActivityAsync(int id, string activity);
    Task<bool> UpdateProfileImageAsync(int id, string imageUrl);
    Task<UserDto?> UpdateProfileAsync(int id, UpdateProfileDto dto);
    Task<ProfileCompletionDto> GetProfileCompletionAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AsNoTracking().AnyAsync(u => u.Username == dto.Username))
            return null;

        if (await _db.Users.AsNoTracking().AnyAsync(u => u.PhoneNumber == dto.PhoneNumber))
            return null;

        var user = new User
        {
            Name = dto.Name,
            Username = dto.Username,
            PhoneNumber = dto.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role
        };

        // Generate unique StudentCode for Students
        if (dto.Role == UserRole.Student)
        {
            user.StudentCode = await GenerateUniqueStudentCodeAsync();
        }

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = GenerateToken(user),
            User = MapToDto(user)
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u =>
            (u.Username == dto.Identifier || u.PhoneNumber == dto.Identifier) && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        // Update last login time
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = GenerateToken(user),
            User = MapToDto(user)
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        return user == null ? null : MapToDto(user);
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        return await _db.Users.AsNoTracking()
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Username = u.Username,
                PhoneNumber = u.PhoneNumber,
                Email = u.Email,
                Role = u.Role.ToString(),
                ProfileImage = u.ProfileImage,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
                LastActivity = u.LastActivity
            })
            .ToListAsync();
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateUserAsync(int id, RegisterDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;

        user.Name = dto.Name;
        user.Username = dto.Username;
        user.PhoneNumber = dto.PhoneNumber;
        user.Role = dto.Role;
        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateLastLoginAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateLastActivityAsync(int id, string activity)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;
        user.LastActivity = activity;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateProfileImageAsync(int id, string imageUrl)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;
        user.ProfileImage = imageUrl;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto?> UpdateProfileAsync(int id, UpdateProfileDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return null;

        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Grade != null) user.Grade = dto.Grade;
        if (dto.School != null) user.School = dto.School;
        if (dto.DateOfBirth.HasValue) user.DateOfBirth = dto.DateOfBirth;

        await _db.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task<ProfileCompletionDto> GetProfileCompletionAsync(int userId)
    {
        var user = await _db.Users
            .Include(u => u.Enrollments)
            .Include(u => u.Results)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return new ProfileCompletionDto { Percentage = 0 };

        var items = new List<ProfileCompletionItem>
        {
            new() { Key = "profileImage", Label = "الصورة الشخصية", IsComplete = !string.IsNullOrEmpty(user.ProfileImage), Weight = 20 },
            new() { Key = "phoneNumber", Label = "رقم الهاتف", IsComplete = !string.IsNullOrEmpty(user.PhoneNumber), Weight = 15 },
            new() { Key = "name", Label = "الاسم الكامل", IsComplete = !string.IsNullOrEmpty(user.Name), Weight = 15 },
            new() { Key = "email", Label = "البريد الإلكتروني", IsComplete = !string.IsNullOrEmpty(user.Email), Weight = 15 },
            new() { Key = "studentCode", Label = "كود الطالب", IsComplete = !string.IsNullOrEmpty(user.StudentCode), Weight = 10 },
            new() { Key = "enrolled", Label = "التسجيل في درس", IsComplete = user.Enrollments.Any(), Weight = 15 },
            new() { Key = "testCompleted", Label = "إكمال اختبار", IsComplete = user.Results.Any(), Weight = 10 }
        };

        var totalWeight = items.Sum(i => i.Weight);
        var completedWeight = items.Where(i => i.IsComplete).Sum(i => i.Weight);
        var percentage = totalWeight > 0 ? (completedWeight * 100) / totalWeight : 0;

        return new ProfileCompletionDto
        {
            Percentage = percentage,
            Items = items
        };
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim("username", user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Username = user.Username,
        PhoneNumber = user.PhoneNumber,
        Email = user.Email,
        Role = user.Role.ToString(),
        ProfileImage = user.ProfileImage,
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt,
        LastActivity = user.LastActivity,
        StudentCode = user.StudentCode,
        Grade = user.Grade,
        School = user.School,
        DateOfBirth = user.DateOfBirth
    };

    private async Task<string> GenerateUniqueStudentCodeAsync()
    {
        var year = DateTime.UtcNow.Year;
        string code;
        bool exists;
        
        do
        {
            var random = new Random();
            var number = random.Next(1, 10000).ToString("D4");
            code = $"STD-{year}-{number}";
            exists = await _db.Users.AsNoTracking().AnyAsync(u => u.StudentCode == code);
        } while (exists);
        
        return code;
    }
}
