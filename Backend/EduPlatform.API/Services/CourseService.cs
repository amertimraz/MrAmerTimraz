using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Services;

public interface ICourseService
{
    Task<List<CourseDto>> GetAllAsync(bool publishedOnly = false);
    Task<CourseDto?> GetByIdAsync(int id);
    Task<CourseDto> CreateAsync(CreateCourseDto dto, int teacherId);
    Task<CourseDto?> UpdateAsync(int id, UpdateCourseDto dto, int teacherId);
    Task<bool> DeleteAsync(int id, int teacherId);
    Task<bool> EnrollAsync(int courseId, int studentId);
    Task<List<CourseDto>> GetTeacherCoursesAsync(int teacherId);
    Task<List<CourseDto>> GetStudentCoursesAsync(int studentId);
}

public class CourseService : ICourseService
{
    private readonly AppDbContext _db;

    public CourseService(AppDbContext db) => _db = db;

    public async Task<List<CourseDto>> GetAllAsync(bool publishedOnly = false)
    {
        var query = _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Videos)
            .Include(c => c.Tests)
            .Include(c => c.Enrollments)
            .AsQueryable();

        if (publishedOnly)
            query = query.Where(c => c.IsPublished);

        return await query.Select(c => MapToDto(c)).ToListAsync();
    }

    public async Task<CourseDto?> GetByIdAsync(int id)
    {
        var course = await _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Videos)
            .Include(c => c.Tests)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id);

        return course == null ? null : MapToDto(course);
    }

    public async Task<CourseDto> CreateAsync(CreateCourseDto dto, int teacherId)
    {
        var course = new Course
        {
            Title = dto.Title,
            Description = dto.Description,
            ThumbnailUrl = dto.ThumbnailUrl,
            Category = dto.Category,
            Price = dto.Price,
            CreatedBy = teacherId
        };

        _db.Courses.Add(course);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(course.Id) ?? MapToDto(course);
    }

    public async Task<CourseDto?> UpdateAsync(int id, UpdateCourseDto dto, int teacherId)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null || (course.CreatedBy != teacherId)) return null;

        if (dto.Title != null) course.Title = dto.Title;
        if (dto.Description != null) course.Description = dto.Description;
        if (dto.ThumbnailUrl != null) course.ThumbnailUrl = dto.ThumbnailUrl;
        if (dto.Category != null) course.Category = dto.Category;
        if (dto.IsPublished.HasValue) course.IsPublished = dto.IsPublished.Value;
        if (dto.Price.HasValue) course.Price = dto.Price.Value;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id, int teacherId)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null || course.CreatedBy != teacherId) return false;
        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> EnrollAsync(int courseId, int studentId)
    {
        if (await _db.Enrollments.AnyAsync(e => e.CourseId == courseId && e.StudentId == studentId))
            return false;

        _db.Enrollments.Add(new Enrollment { CourseId = courseId, StudentId = studentId });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<CourseDto>> GetTeacherCoursesAsync(int teacherId)
    {
        return await _db.Courses
            .Where(c => c.CreatedBy == teacherId)
            .Include(c => c.Teacher)
            .Include(c => c.Videos)
            .Include(c => c.Tests)
            .Include(c => c.Enrollments)
            .Select(c => MapToDto(c))
            .ToListAsync();
    }

    public async Task<List<CourseDto>> GetStudentCoursesAsync(int studentId)
    {
        return await _db.Enrollments
            .Where(e => e.StudentId == studentId)
            .Include(e => e.Course).ThenInclude(c => c.Teacher)
            .Include(e => e.Course).ThenInclude(c => c.Videos)
            .Include(e => e.Course).ThenInclude(c => c.Tests)
            .Include(e => e.Course).ThenInclude(c => c.Enrollments)
            .Select(e => MapToDto(e.Course))
            .ToListAsync();
    }

    private static CourseDto MapToDto(Course c) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Description = c.Description,
        ThumbnailUrl = c.ThumbnailUrl,
        Category = c.Category,
        IsPublished = c.IsPublished,
        Price = c.Price,
        IsFree = c.IsFree,
        TeacherName = c.Teacher?.Name ?? "",
        TeacherId = c.CreatedBy,
        CreatedAt = c.CreatedAt,
        VideoCount = c.Videos?.Count ?? 0,
        TestCount = c.Tests?.Count ?? 0,
        EnrolledCount = c.Enrollments?.Count ?? 0
    };
}
