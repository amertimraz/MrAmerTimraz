using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Services;

public interface IPaymentService
{
    Task<PaymentRequestDto?> CreateRequestAsync(CreatePaymentRequestDto dto, int studentId, string? receiptUrl);
    Task<List<PaymentRequestDto>> GetAllRequestsAsync();
    Task<List<PaymentRequestDto>> GetStudentRequestsAsync(int studentId);
    Task<PaymentRequestDto?> ReviewRequestAsync(int id, ReviewPaymentDto dto);
    Task<bool> HasPendingOrApprovedAsync(int courseId, int studentId);
}

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db) => _db = db;

    public async Task<PaymentRequestDto?> CreateRequestAsync(CreatePaymentRequestDto dto, int studentId, string? receiptUrl)
    {
        var course = await _db.Courses.FindAsync(dto.CourseId);
        if (course == null) return null;

        if (await _db.Enrollments.AnyAsync(e => e.CourseId == dto.CourseId && e.StudentId == studentId))
            return null;

        if (await _db.PaymentRequests.AnyAsync(p =>
            p.CourseId == dto.CourseId && p.StudentId == studentId &&
            (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Approved)))
            return null;

        var request = new PaymentRequest
        {
            StudentId = studentId,
            CourseId = dto.CourseId,
            AmountPaid = dto.AmountPaid,
            Notes = dto.Notes,
            ReceiptImageUrl = receiptUrl
        };

        _db.PaymentRequests.Add(request);
        await _db.SaveChangesAsync();

        return await GetDtoById(request.Id);
    }

    public async Task<List<PaymentRequestDto>> GetAllRequestsAsync()
    {
        return await _db.PaymentRequests
            .Include(p => p.Student)
            .Include(p => p.Course)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    public async Task<List<PaymentRequestDto>> GetStudentRequestsAsync(int studentId)
    {
        return await _db.PaymentRequests
            .Where(p => p.StudentId == studentId)
            .Include(p => p.Student)
            .Include(p => p.Course)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    public async Task<PaymentRequestDto?> ReviewRequestAsync(int id, ReviewPaymentDto dto)
    {
        var request = await _db.PaymentRequests
            .Include(p => p.Student)
            .Include(p => p.Course)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (request == null || request.Status != PaymentStatus.Pending) return null;

        request.Status = dto.Approve ? PaymentStatus.Approved : PaymentStatus.Rejected;
        request.AdminNote = dto.AdminNote;
        request.ReviewedAt = DateTime.UtcNow;

        if (dto.Approve)
        {
            var alreadyEnrolled = await _db.Enrollments
                .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == request.StudentId);

            if (!alreadyEnrolled)
                _db.Enrollments.Add(new Enrollment { CourseId = request.CourseId, StudentId = request.StudentId });
        }

        await _db.SaveChangesAsync();
        return MapToDto(request);
    }

    public async Task<bool> HasPendingOrApprovedAsync(int courseId, int studentId)
    {
        return await _db.PaymentRequests.AnyAsync(p =>
            p.CourseId == courseId && p.StudentId == studentId &&
            (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Approved));
    }

    private async Task<PaymentRequestDto?> GetDtoById(int id)
    {
        var p = await _db.PaymentRequests
            .Include(p => p.Student)
            .Include(p => p.Course)
            .FirstOrDefaultAsync(p => p.Id == id);
        return p == null ? null : MapToDto(p);
    }

    private static PaymentRequestDto MapToDto(PaymentRequest p) => new()
    {
        Id = p.Id,
        StudentId = p.StudentId,
        StudentName = p.Student?.Name ?? "",
        StudentUsername = p.Student?.Username ?? "",
        StudentPhone = p.Student?.PhoneNumber ?? "",
        CourseId = p.CourseId,
        CourseTitle = p.Course?.Title ?? "",
        CoursePrice = p.Course?.Price ?? 0,
        AmountPaid = p.AmountPaid,
        ReceiptImageUrl = p.ReceiptImageUrl,
        Notes = p.Notes,
        Status = p.Status.ToString(),
        AdminNote = p.AdminNote,
        CreatedAt = p.CreatedAt,
        ReviewedAt = p.ReviewedAt
    };
}
