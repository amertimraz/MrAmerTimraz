using EduPlatform.API.DTOs;
using EduPlatform.API.Services;
using EduPlatform.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly AppDbContext _db;

    public AuthController(IAuthService auth, AppDbContext db)
    {
        _auth = auth;
        _db = db;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        if (result == null) return BadRequest(new { message = "Email already exists" });
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        if (result == null) return Unauthorized(new { message = "Invalid credentials" });
        return Ok(result);
    }

    [HttpGet("me"), Authorize]
    public async Task<IActionResult> Me()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _auth.GetUserByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpGet("users"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers() => Ok(await _auth.GetAllUsersAsync());

    [HttpGet("users/{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _auth.GetUserByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpDelete("users/{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        return await _auth.DeleteUserAsync(id) ? NoContent() : NotFound();
    }

    [HttpPut("users/{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] RegisterDto dto)
    {
        return await _auth.UpdateUserAsync(id, dto) ? NoContent() : NotFound();
    }

    // Any authenticated user can update their OWN profile image
    [HttpPut("profile/image"), Authorize]
    public async Task<IActionResult> UpdateMyProfileImage([FromBody] UpdateProfileImageDto dto)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var ok = await _auth.UpdateProfileImageAsync(id, dto.ImageUrl);
        if (!ok) return NotFound();
        var user = await _auth.GetUserByIdAsync(id);
        return Ok(user);
    }

    // Admin can update any user's profile image
    [HttpPut("users/{id}/image"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUserProfileImage(int id, [FromBody] UpdateProfileImageDto dto)
    {
        var ok = await _auth.UpdateProfileImageAsync(id, dto.ImageUrl);
        return ok ? Ok() : NotFound();
    }

    // Get user stats (courses enrolled, tests completed)
    [HttpGet("users/{id}/stats"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserStats(int id)
    {
        var enrolledCount = await _db.Enrollments.CountAsync(e => e.StudentId == id);
        var completedTests = await _db.Results.CountAsync(r => r.StudentId == id);
        return Ok(new { enrolledCount, completedTests });
    }
}
