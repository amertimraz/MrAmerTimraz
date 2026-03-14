using EduPlatform.API.DTOs;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courses;

    public CoursesController(ICourseService courses) => _courses = courses;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool publishedOnly = false)
        => Ok(await _courses.GetAllAsync(publishedOnly));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var course = await _courses.GetByIdAsync(id);
        return course == null ? NotFound() : Ok(course);
    }

    [HttpGet("teacher/my"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetMyTeacherCourses()
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _courses.GetTeacherCoursesAsync(teacherId));
    }

    [HttpGet("student/my"), Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyStudentCourses()
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _courses.GetStudentCoursesAsync(studentId));
    }

    [HttpPost, Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCourseDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var course = await _courses.CreateAsync(dto, teacherId);
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course);
    }

    [HttpPut("{id}"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCourseDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = User.IsInRole("Admin");
        var course = await _courses.UpdateAsync(id, dto, userId, isAdmin);
        return course == null ? NotFound() : Ok(course);
    }

    [HttpDelete("{id}"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = User.IsInRole("Admin");
        return await _courses.DeleteAsync(id, userId, isAdmin) ? NoContent() : NotFound();
    }

    [HttpPost("{id}/enroll"), Authorize(Roles = "Student")]
    public async Task<IActionResult> Enroll(int id)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _courses.EnrollAsync(id, studentId);
        return result ? Ok(new { message = "Enrolled successfully" })
                      : BadRequest(new { message = "Already enrolled" });
    }
}
