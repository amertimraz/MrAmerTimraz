using EduPlatform.API.DTOs;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController : ControllerBase
{
    private readonly ITestService _tests;

    public TestsController(ITestService tests) => _tests = tests;

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(int courseId)
        => Ok(await _tests.GetByCourseAsync(courseId));

    [HttpGet("teacher/my"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetMyTests()
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _tests.GetByTeacherAsync(teacherId));
    }

    [HttpGet("{id}"), Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var isTeacherOrAdmin = User.IsInRole("Teacher") || User.IsInRole("Admin");
        var test = await _tests.GetByIdAsync(id, isTeacherOrAdmin);
        return test == null ? NotFound() : Ok(test);
    }

    [HttpPost, Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateTestDto dto)
    {
        var test = await _tests.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = test.Id }, test);
    }

    [HttpPost("{testId}/questions"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> AddQuestion(int testId, [FromBody] CreateQuestionDto dto)
    {
        return await _tests.AddQuestionAsync(testId, dto)
            ? Ok(new { message = "Question added" })
            : NotFound();
    }

    [HttpDelete("questions/{questionId}"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> DeleteQuestion(int questionId)
    {
        return await _tests.DeleteQuestionAsync(questionId) ? NoContent() : NotFound();
    }

    [HttpPost("{testId}/publish"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Publish(int testId)
    {
        return await _tests.PublishAsync(testId)
            ? Ok(new { message = "Test published" })
            : NotFound();
    }

    [HttpPost("submit"), Authorize(Roles = "Student")]
    public async Task<IActionResult> Submit([FromBody] SubmitTestDto dto)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _tests.SubmitAsync(dto, studentId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("results/my"), Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyResults()
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var results = await _tests.GetStudentResultsAsync(studentId);
        return Ok(results.Select(r => new
        {
            r.Id,
            r.Score,
            r.MaxScore,
            Percentage = r.MaxScore > 0 ? (r.Score / r.MaxScore) * 100 : 0,
            r.Passed,
            r.CompletedAt,
            TestTitle = r.Test?.Title,
            CourseTitle = r.Test?.Course?.Title
        }));
    }

    [HttpGet("{testId}/results"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetTestResults(int testId)
    {
        var results = await _tests.GetTestResultsAsync(testId);
        return Ok(results.Select(r => new
        {
            r.Id,
            r.Score,
            r.MaxScore,
            Percentage = r.MaxScore > 0 ? (r.Score / r.MaxScore) * 100 : 0,
            r.Passed,
            r.CompletedAt,
            StudentName = r.Student?.Name,
            StudentEmail = r.Student?.Email
        }));
    }

    [HttpDelete("{testId}"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> DeleteTest(int testId)
    {
        return await _tests.DeleteTestAsync(testId) ? NoContent() : NotFound();
    }
}
