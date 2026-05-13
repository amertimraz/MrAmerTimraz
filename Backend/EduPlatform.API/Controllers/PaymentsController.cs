using EduPlatform.API.DTOs;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("auth")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;
    private readonly IKashierService _kashier;
    private readonly IWebHostEnvironment _env;

    public PaymentsController(IPaymentService payments, IKashierService kashier, IWebHostEnvironment env)
    {
        _payments = payments;
        _kashier = kashier;
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

        var (result, error) = await _payments.CreateRequestAsync(dto, studentId, receiptUrl);
        if (error != null) return BadRequest(new { message = error });
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

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(int? courseId, int? sessionId, int? bookletId)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var has = await _payments.HasPendingOrApprovedAsync(courseId, sessionId, bookletId, studentId);
        return Ok(new { hasPendingOrApproved = has });
    }

    [HttpGet("access")]
    public async Task<IActionResult> GetAccessStatus(int? courseId, int? sessionId, int? bookletId)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var has = await _payments.HasApprovedOnlyAsync(courseId, sessionId, bookletId, studentId);
        return Ok(new { hasAccess = has });
    }

    [HttpGet("booklet-stats"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetBookletStats()
        => Ok(await _payments.GetBookletPurchaseStatsAsync());

    [HttpPost("kashier/initiate"), AllowAnonymous]
    public async Task<IActionResult> InitiateKashier([FromBody] CreatePaymentRequestDto dto)
    {
        int? studentId = null;
        var studentIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (studentIdClaim != null) studentId = int.Parse(studentIdClaim);

        var studentName = User.FindFirstValue(ClaimTypes.Name) ?? dto.GuestName ?? "Guest";

        var (result, error) = await _payments.CreateRequestAsync(dto, studentId, null);
        if (error != null) return BadRequest(new { message = error });

        // Generate Kashier URL
        var paymentUrl = _kashier.GeneratePaymentUrl(result!.Id, dto.AmountPaid, studentName);
        
        return Ok(new { paymentUrl });
    }

    [HttpGet("kashier/callback"), AllowAnonymous]
    public async Task<IActionResult> KashierCallback([FromQuery] string paymentStatus, [FromQuery] string orderId)
    {
        // orderId here is our PaymentRequest.Id
        var id = int.Parse(orderId);
        if (paymentStatus == "SUCCESS")
        {
            var result = await _payments.ReviewRequestAsync(id, new ReviewPaymentDto { Approve = true, AdminNote = "Paid via Kashier" });
            return Redirect($"/payment/success?orderId={id}&token={result?.DownloadToken}");
        }
        return Redirect($"/payment/failed?orderId={id}");
    }
}
