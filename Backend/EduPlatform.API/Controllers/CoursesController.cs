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
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var course = await _courses.UpdateAsync(id, dto, teacherId);
        return course == null ? NotFound() : Ok(course);
    }

    [HttpDelete("{id}"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await _courses.DeleteAsync(id, teacherId) ? NoContent() : NotFound();
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
