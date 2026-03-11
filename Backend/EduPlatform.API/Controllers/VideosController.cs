using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController : ControllerBase
{
    private readonly IVideoService _videos;

    public VideosController(IVideoService videos) => _videos = videos;

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(int courseId)
        => Ok(await _videos.GetByCourseAsync(courseId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var video = await _videos.GetByIdAsync(id);
        return video == null ? NotFound() : Ok(video);
    }

    [HttpPost, Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateVideoDto dto)
    {
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
}
