using EduPlatform.API.DTOs;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;
    private readonly IWebHostEnvironment _env;

    public PaymentsController(IPaymentService payments, IWebHostEnvironment env)
    {
        _payments = payments;
        _env = env;
    }

    [HttpPost("request")]
    public async Task<IActionResult> CreateRequest([FromForm] CreatePaymentRequestDto dto, IFormFile? receipt)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        string? receiptUrl = null;
        if (receipt != null && receipt.Length > 0)
        {
            var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "receipts");
            Directory.CreateDirectory(uploadsDir);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(receipt.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);
            await using var stream = System.IO.File.Create(filePath);
            await receipt.CopyToAsync(stream);
            receiptUrl = $"/uploads/receipts/{fileName}";
        }

        var result = await _payments.CreateRequestAsync(dto, studentId, receiptUrl);
        if (result == null) return BadRequest("طلب موجود بالفعل أو الطالب مسجّل في الكورس.");
        return Ok(result);
    }

    [HttpGet, Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
        => Ok(await _payments.GetAllRequestsAsync());

    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _payments.GetStudentRequestsAsync(studentId));
    }

    [HttpPut("{id}/review"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Review(int id, [FromBody] ReviewPaymentDto dto)
    {
        var result = await _payments.ReviewRequestAsync(id, dto);
        if (result == null) return BadRequest("الطلب غير موجود أو تمت مراجعته بالفعل.");
        return Ok(result);
    }

    [HttpGet("status/{courseId}")]
    public async Task<IActionResult> GetStatus(int courseId)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var has = await _payments.HasPendingOrApprovedAsync(courseId, studentId);
        return Ok(new { hasPendingOrApproved = has });
    }
}
