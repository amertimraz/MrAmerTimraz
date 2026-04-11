using System.Security.Claims;
using EduPlatform.API.Services;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduPlatform.API.Data;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController : ControllerBase
{
    private readonly IVideoService _videos;
    private readonly AppDbContext _db;
    private readonly IMuxService _mux;

    public VideosController(IVideoService videos, AppDbContext db, IMuxService mux)
    {
        _videos = videos;
        _db = db;
        _mux = mux;
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(int courseId)
        => Ok(await _videos.GetByCourseAsync(courseId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var video = await _videos.GetByIdAsync(id);
        return video == null ? NotFound() : Ok(video);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var video = await _videos.GetBySlugAsync(slug);
        if (video == null) return NotFound();

        // Security check: Check if enrolled if it's not a free course
        var course = await _db.Courses.FindAsync(video.CourseId);
        if (course != null && !course.IsFree && !User.IsInRole("Admin") && !User.IsInRole("Teacher"))
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            bool isEnrolled = await _db.Enrollments.AnyAsync(e => e.CourseId == video.CourseId && e.StudentId == userId);
            if (!isEnrolled) return StatusCode(403, "يجب الاشتراك في الكورس لمشاهدة هذا الدرس.");
        }

        return Ok(video);
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(int id)
        => Ok(await _videos.GetCommentsAsync(id));

    [HttpPost("{id}/comments"), Authorize]
    public async Task<IActionResult> AddComment(int id, [FromBody] CommentDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (userId == 0) return Unauthorized();

        var video = await _videos.GetByIdAsync(id);
        if (video == null) return NotFound();

        // Security check: Check if enrolled
        var course = await _db.Courses.FindAsync(video.CourseId);
        if (course != null && !course.IsFree && !User.IsInRole("Admin") && !User.IsInRole("Teacher"))
        {
            bool isEnrolled = await _db.Enrollments.AnyAsync(e => e.CourseId == video.CourseId && e.StudentId == userId);
            if (!isEnrolled) return StatusCode(403, "يجب الاشتراك في الكورس للتمكن من التعليق.");
        }
        
        var comment = await _videos.AddCommentAsync(id, userId, dto.Content, dto.ParentId);
        return Ok(comment);
    }

    [HttpDelete("comments/{commentId}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteComment(int commentId)
    {
        return await _videos.DeleteCommentAsync(commentId) ? NoContent() : NotFound();
    }

    [HttpPost, Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateVideoDto dto)
    {
        // If source is Mux, upload video to Mux and get playback ID
        if (dto.Source == VideoSource.Mux && !string.IsNullOrEmpty(dto.Url))
        {
            var playbackId = await _mux.UploadVideoAsync(dto.Url, dto.Title, dto.ThumbnailUrl);
            if (!string.IsNullOrEmpty(playbackId))
            {
                // Store Mux playback URL
                dto.Url = $"https://stream.mux.com/{playbackId}.m3u8";
            }
        }

        var video = await _videos.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = video.Id }, video);
    }

    [HttpPut("{id}"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateVideoDto dto)
    {
        return await _videos.UpdateAsync(id, dto) ? NoContent() : NotFound();
    }

    [HttpDelete("{id}"), Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        return await _videos.DeleteAsync(id) ? NoContent() : NotFound();
    }
    [HttpPost("comments/{id}/react"), Authorize]
    public async Task<IActionResult> React(int id, [FromBody] ReactionDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        await _videos.ToggleReactionAsync(id, userId, dto.Type);
        return Ok();
    }
}
