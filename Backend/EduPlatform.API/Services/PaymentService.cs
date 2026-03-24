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
    Task<bool> HasPendingOrApprovedAsync(int? courseId, int? sessionId, int? bookletId, int studentId);
}

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db) => _db = db;

    public async Task<PaymentRequestDto?> CreateRequestAsync(CreatePaymentRequestDto dto, int studentId, string? receiptUrl)
    {
        if (dto.CourseId.HasValue)
        {
            var course = await _db.Courses.FindAsync(dto.CourseId);
            if (course == null) return null;

            if (await _db.Enrollments.AnyAsync(e => e.CourseId == dto.CourseId && e.StudentId == studentId))
                return null;

            if (await _db.PaymentRequests.AnyAsync(p =>
                p.CourseId == dto.CourseId && p.StudentId == studentId &&
                (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Approved)))
                return null;
        }
        else if (dto.LiveSessionId.HasValue)
        {
            var session = await _db.LiveSessions.FindAsync(dto.LiveSessionId);
            if (session == null) return null;

            if (await _db.LiveSessionEnrollments.AnyAsync(e => e.LiveSessionId == dto.LiveSessionId && e.StudentId == studentId))
                return null;

            if (await _db.PaymentRequests.AnyAsync(p =>
                p.LiveSessionId == dto.LiveSessionId && p.StudentId == studentId &&
                (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Approved)))
                return null;
        }
        else if (dto.BookletId.HasValue)
        {
            var booklet = await _db.Booklets.FindAsync(dto.BookletId);
            if (booklet == null) return null;

            if (await _db.PaymentRequests.AnyAsync(p =>
                p.BookletId == dto.BookletId && p.StudentId == studentId &&
                (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Approved)))
                return null;
        }
        else
        {
            return null;
        }

        var request = new PaymentRequest
        {
            StudentId = studentId,
            CourseId = dto.CourseId,
            LiveSessionId = dto.LiveSessionId,
            BookletId = dto.BookletId,
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
            .Include(p => p.LiveSession)
            .Include(p => p.Booklet)
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
            .Include(p => p.LiveSession)
            .Include(p => p.Booklet)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    public async Task<PaymentRequestDto?> ReviewRequestAsync(int id, ReviewPaymentDto dto)
    {
        var request = await _db.PaymentRequests
            .Include(p => p.Student)
            .Include(p => p.Course)
            .Include(p => p.LiveSession)
            .Include(p => p.Booklet)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (request == null || request.Status != PaymentStatus.Pending) return null;

        request.Status = dto.Approve ? PaymentStatus.Approved : PaymentStatus.Rejected;
        request.AdminNote = dto.AdminNote;
        request.ReviewedAt = DateTime.UtcNow;

        if (dto.Approve)
        {
            if (request.CourseId.HasValue)
            {
                var alreadyEnrolled = await _db.Enrollments
                    .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == request.StudentId);

                if (!alreadyEnrolled)
                    _db.Enrollments.Add(new Enrollment { CourseId = request.CourseId.Value, StudentId = request.StudentId });
            }
            else if (request.LiveSessionId.HasValue)
            {
                var alreadyEnrolled = await _db.LiveSessionEnrollments
                    .AnyAsync(e => e.LiveSessionId == request.LiveSessionId && e.StudentId == request.StudentId);

                if (!alreadyEnrolled)
                    _db.LiveSessionEnrollments.Add(new LiveSessionEnrollment { LiveSessionId = request.LiveSessionId.Value, StudentId = request.StudentId });
            }
        }

        await _db.SaveChangesAsync();
        return MapToDto(request);
    }

    public async Task<bool> HasPendingOrApprovedAsync(int? courseId, int? sessionId, int? bookletId, int studentId)
    {
        if (courseId.HasValue)
        {
            return await _db.PaymentRequests.AnyAsync(p =>
                p.CourseId == courseId && p.StudentId == studentId &&
                (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Approved));
        }
        if (sessionId.HasValue)
        {
            return await _db.PaymentRequests.AnyAsync(p =>
                p.LiveSessionId == sessionId && p.StudentId == studentId &&
                (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Approved));
        }
        if (bookletId.HasValue)
        {
            return await _db.PaymentRequests.AnyAsync(p =>
                p.BookletId == bookletId && p.StudentId == studentId &&
                (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Approved));
        }
        return false;
    }

    private async Task<PaymentRequestDto?> GetDtoById(int id)
    {
        var p = await _db.PaymentRequests
            .Include(p => p.Student)
            .Include(p => p.Course)
            .Include(p => p.LiveSession)
            .Include(p => p.Booklet)
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
        LiveSessionId = p.LiveSessionId,
        LiveSessionTitle = p.LiveSession?.Title ?? "",
        LiveSessionPrice = p.LiveSession?.Price ?? 0,
        BookletId = p.BookletId,
        BookletTitle = p.Booklet?.Title ?? "",
        BookletPrice = p.Booklet?.Price ?? 0,
        AmountPaid = p.AmountPaid,
        ReceiptImageUrl = p.ReceiptImageUrl,
        Notes = p.Notes,
        Status = p.Status.ToString(),
        AdminNote = p.AdminNote,
        CreatedAt = p.CreatedAt,
        ReviewedAt = p.ReviewedAt
    };
}
