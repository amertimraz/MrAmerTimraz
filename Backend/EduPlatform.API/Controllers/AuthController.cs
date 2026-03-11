using EduPlatform.API.DTOs;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

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
}
