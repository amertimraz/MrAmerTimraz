using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EduPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChallengesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChallengesController(AppDbContext context)
        {
            _context = context;
        }

        // --- Student Endpoints ---

        [HttpGet, Authorize]
        public async Task<ActionResult<IEnumerable<ChallengeDTO>>> GetVisibleChallenges()
        {
            var challenges = await _context.Challenges
                .Where(c => c.IsVisible)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => MapToDTO(c, false))
                .ToListAsync();

            return Ok(challenges);
        }

        [HttpGet("slug/{slug}"), Authorize]
        public async Task<ActionResult<ChallengeDTO>> GetBySlug(string slug)
        {
            var challenge = await _context.Challenges
                .Include(c => c.Snippets)
                .FirstOrDefaultAsync(c => c.Slug.ToLower() == slug.ToLower());

            if (challenge == null) return NotFound();

            // Check if it's visible or user is admin
            if (!challenge.IsVisible && !User.IsInRole("Admin")) return NotFound();

            return Ok(MapToDTO(challenge, true));
        }

        // --- Admin Endpoints ---

        [HttpGet("admin"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ChallengeDTO>>> GetAllChallenges()
        {
            var challenges = await _context.Challenges
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => MapToDTO(c, false))
                .ToListAsync();

            return Ok(challenges);
        }

        [HttpPost, Authorize(Roles = "Admin")]
        public async Task<ActionResult<ChallengeDTO>> Create(CreateChallengeDTO dto)
        {
            if (await _context.Challenges.AnyAsync(c => c.Slug == dto.Slug))
                return BadRequest("هذا الرابط (Slug) مستخدم بالفعل.");

            var challenge = new Challenge
            {
                Title = dto.Title,
                Slug = dto.Slug,
                Description = dto.Description,
                TargetOutput = dto.TargetOutput,
                Price = dto.Price,
                IsVisible = dto.IsVisible,
                TimeLimitMinutes = dto.TimeLimitMinutes,
                Snippets = dto.Snippets.Select(s => new ChallengeSnippet
                {
                    Code = s.Code,
                    AnalysisType = s.AnalysisType,
                    AnalysisMessage = s.AnalysisMessage,
                    OrderIndex = s.OrderIndex
                }).ToList()
            };

            _context.Challenges.Add(challenge);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBySlug), new { slug = challenge.Slug }, MapToDTO(challenge, true));
        }

        [HttpPut("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, CreateChallengeDTO dto)
        {
            var challenge = await _context.Challenges
                .Include(c => c.Snippets)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (challenge == null) return NotFound();

            if (await _context.Challenges.AnyAsync(c => c.Slug == dto.Slug && c.Id != id))
                return BadRequest("هذا الرابط (Slug) مستخدم بالفعل.");

            challenge.Title = dto.Title;
            challenge.Slug = dto.Slug;
            challenge.Description = dto.Description;
            challenge.TargetOutput = dto.TargetOutput;
            challenge.Price = dto.Price;
            challenge.IsVisible = dto.IsVisible;
            challenge.TimeLimitMinutes = dto.TimeLimitMinutes;

            // Simple replace of snippets
            _context.ChallengeSnippets.RemoveRange(challenge.Snippets);
            challenge.Snippets = dto.Snippets.Select(s => new ChallengeSnippet
            {
                Code = s.Code,
                AnalysisType = s.AnalysisType,
                AnalysisMessage = s.AnalysisMessage,
                OrderIndex = s.OrderIndex
            }).ToList();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var challenge = await _context.Challenges.FindAsync(id);
            if (challenge == null) return NotFound();

            _context.Challenges.Remove(challenge);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static ChallengeDTO MapToDTO(Challenge c, bool includeSnippets)
        {
            return new ChallengeDTO
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug,
                Description = c.Description,
                TargetOutput = c.TargetOutput,
                Price = c.Price,
                IsVisible = c.IsVisible,
                TimeLimitMinutes = c.TimeLimitMinutes,
                Snippets = includeSnippets ? c.Snippets.OrderBy(s => s.OrderIndex).Select(s => new ChallengeSnippetDTO
                {
                    Id = s.Id,
                    Code = s.Code,
                    AnalysisType = s.AnalysisType,
                    AnalysisMessage = s.AnalysisMessage,
                    OrderIndex = s.OrderIndex
                }).ToList() : new List<ChallengeSnippetDTO>()
            };
        }
    }
}
