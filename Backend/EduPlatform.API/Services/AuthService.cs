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
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return null;

        if (await _db.Users.AnyAsync(u => u.PhoneNumber == dto.PhoneNumber))
            return null;

        var user = new User
        {
            Name = dto.Name,
            Username = dto.Username,
            PhoneNumber = dto.PhoneNumber,
            PlainPassword = dto.Password,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role
        };

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
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            (u.Username == dto.Identifier || u.PhoneNumber == dto.Identifier) && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

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
        return await _db.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Username = u.Username,
                PhoneNumber = u.PhoneNumber,
                Email = u.Email,
                PlainPassword = u.PlainPassword,
                Role = u.Role.ToString(),
                ProfileImage = u.ProfileImage,
                CreatedAt = u.CreatedAt
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
            user.PlainPassword = dto.Password;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _db.SaveChangesAsync();
        return true;
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
        PlainPassword = user.PlainPassword,
        Role = user.Role.ToString(),
        ProfileImage = user.ProfileImage,
        CreatedAt = user.CreatedAt
    };
}
