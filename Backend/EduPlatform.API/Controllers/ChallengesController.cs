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
    [Route("api/challenges")] // Keep generic route for compatibility or update to "tofastests"
    public class ChallengesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChallengesController(AppDbContext context)
        {
            _context = context;
        }

        // --- Student Endpoints ---

        [HttpGet, Authorize]
        public async Task<ActionResult<IEnumerable<TofasTestDTO>>> GetVisibleTests()
        {
            var tests = await _context.TofasTests
                .Where(t => t.IsVisible)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapTestToDTO(t, false))
                .ToListAsync();

            return Ok(tests);
        }

        [HttpGet("slug/{slug}"), Authorize]
        public async Task<ActionResult<TofasTestDTO>> GetBySlug(string slug)
        {
            var test = await _context.TofasTests
                .Include(t => t.Questions)
                    .ThenInclude(q => q.Snippets)
                .FirstOrDefaultAsync(t => t.Slug.ToLower() == slug.ToLower());

            if (test == null) return NotFound();

            if (!test.IsVisible && !User.IsInRole("Admin")) return NotFound();

            return Ok(MapTestToDTO(test, true));
        }

        // --- Admin Endpoints (Tests) ---

        [HttpGet("admin"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<TofasTestDTO>>> GetAllTests()
        {
            var tests = await _context.TofasTests
                .Include(t => t.Questions)
                    .ThenInclude(q => q.Snippets)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tests.Select(t => MapTestToDTO(t, true)));
        }

        [HttpPost, Authorize(Roles = "Admin")]
        public async Task<ActionResult<TofasTestDTO>> CreateTest(CreateTofasTestDTO dto)
        {
            if (await _context.TofasTests.AnyAsync(t => t.Slug == dto.Slug))
                return BadRequest("هذا الرابط (Slug) مستخدم بالفعل.");

            var test = new TofasTest
            {
                Title = dto.Title,
                Slug = dto.Slug,
                Description = dto.Description,
                Price = dto.Price,
                IsVisible = dto.IsVisible,
                TimeLimitMinutes = dto.TimeLimitMinutes
            };

            _context.TofasTests.Add(test);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBySlug), new { slug = test.Slug }, MapTestToDTO(test, false));
        }

        [HttpPut("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTest(int id, CreateTofasTestDTO dto)
        {
            var test = await _context.TofasTests.FindAsync(id);
            if (test == null) return NotFound();

            if (await _context.TofasTests.AnyAsync(t => t.Slug == dto.Slug && t.Id != id))
                return BadRequest("هذا الرابط (Slug) مستخدم بالفعل.");

            test.Title = dto.Title;
            test.Slug = dto.Slug;
            test.Description = dto.Description;
            test.Price = dto.Price;
            test.IsVisible = dto.IsVisible;
            test.TimeLimitMinutes = dto.TimeLimitMinutes;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTest(int id)
        {
            var test = await _context.TofasTests.FindAsync(id);
            if (test == null) return NotFound();

            _context.TofasTests.Remove(test);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Admin Endpoints (Questions/Challenges) ---

        [HttpPost("{testId}/questions"), Authorize(Roles = "Admin")]
        public async Task<ActionResult<ChallengeDTO>> AddQuestion(int testId, CreateChallengeDTO dto)
        {
            var test = await _context.TofasTests.FindAsync(testId);
            if (test == null) return NotFound("Test not found");

            var question = new Challenge
            {
                TestId = testId,
                Title = dto.Title,
                Slug = dto.Slug,
                Description = dto.Description,
                TargetOutput = dto.TargetOutput,
                OrderIndex = dto.OrderIndex,
                Snippets = dto.Snippets.Select(s => new ChallengeSnippet
                {
                    Code = s.Code,
                    AnalysisType = s.AnalysisType,
                    AnalysisMessage = s.AnalysisMessage,
                    OrderIndex = s.OrderIndex
                }).ToList()
            };

            _context.Challenges.Add(question);
            await _context.SaveChangesAsync();

            return Ok(MapQuestionToDTO(question));
        }

        [HttpPut("questions/{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateQuestion(int id, CreateChallengeDTO dto)
        {
            var question = await _context.Challenges
                .Include(q => q.Snippets)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (question == null) return NotFound();

            question.Title = dto.Title;
            question.Slug = dto.Slug;
            question.Description = dto.Description;
            question.TargetOutput = dto.TargetOutput;
            question.OrderIndex = dto.OrderIndex;

            _context.ChallengeSnippets.RemoveRange(question.Snippets);
            question.Snippets = dto.Snippets.Select(s => new ChallengeSnippet
            {
                Code = s.Code,
                AnalysisType = s.AnalysisType,
                AnalysisMessage = s.AnalysisMessage,
                OrderIndex = s.OrderIndex
            }).ToList();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("questions/{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.Challenges.FindAsync(id);
            if (question == null) return NotFound();

            _context.Challenges.Remove(question);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Result Endpoints ---

        [HttpPost("{testId}/submit"), Authorize]
        public async Task<ActionResult<TofasTestResultDTO>> SubmitResult(int testId, SubmitTofasTestResultDTO dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            var test = await _context.TofasTests.FindAsync(testId);
            if (test == null) return NotFound("Test not found");

            var result = new TofasTestResult
            {
                TestId = testId,
                StudentId = userId,
                Score = dto.Score,
                TotalQuestions = dto.TotalQuestions,
                CorrectCount = dto.CorrectCount,
                Percentage = dto.TotalQuestions > 0 ? (double)dto.CorrectCount / dto.TotalQuestions * 100 : 0,
                CompletedAt = DateTime.UtcNow
            };

            _context.TofasTestResults.Add(result);
            await _context.SaveChangesAsync();

            return Ok(new TofasTestResultDTO
            {
                Id = result.Id,
                TestId = result.TestId,
                StudentName = user.FullName,
                Score = result.Score,
                TotalQuestions = result.TotalQuestions,
                CorrectCount = result.CorrectCount,
                Percentage = result.Percentage,
                CompletedAt = result.CompletedAt
            });
        }

        [HttpGet("{testId}/results"), Authorize]
        public async Task<ActionResult<IEnumerable<TofasTestResultDTO>>> GetResults(int testId)
        {
            var results = await _context.TofasTestResults
                .Include(r => r.Student)
                .Where(r => r.TestId == testId)
                .OrderByDescending(r => r.Score)
                .ThenBy(r => r.CompletedAt)
                .Take(100) // Leaderboard top 100
                .Select(r => new TofasTestResultDTO
                {
                    Id = r.Id,
                    TestId = r.TestId,
                    StudentName = r.Student.FullName,
                    Score = r.Score,
                    TotalQuestions = r.TotalQuestions,
                    CorrectCount = r.CorrectCount,
                    Percentage = r.Percentage,
                    CompletedAt = r.CompletedAt
                })
                .ToListAsync();

            return Ok(results);
        }

        [HttpDelete("{testId}/results"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> ClearResults(int testId)
        {
            var results = await _context.TofasTestResults.Where(r => r.TestId == testId).ToListAsync();
            _context.TofasTestResults.RemoveRange(results);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Helpers ---

        private static TofasTestDTO MapTestToDTO(TofasTest t, bool includeQuestions)
        {
            return new TofasTestDTO
            {
                Id = t.Id,
                Title = t.Title,
                Slug = t.Slug,
                Description = t.Description,
                Price = t.Price,
                IsVisible = t.IsVisible,
                TimeLimitMinutes = t.TimeLimitMinutes,
                CreatedAt = t.CreatedAt,
                Questions = includeQuestions ? t.Questions.OrderBy(q => q.OrderIndex).Select(MapQuestionToDTO).ToList() : new List<ChallengeDTO>()
            };
        }

        private static ChallengeDTO MapQuestionToDTO(Challenge q)
        {
            return new ChallengeDTO
            {
                Id = q.Id,
                Title = q.Title,
                Slug = q.Slug,
                Description = q.Description,
                TargetOutput = q.TargetOutput,
                TestId = q.TestId,
                OrderIndex = q.OrderIndex,
                Snippets = q.Snippets.OrderBy(s => s.OrderIndex).Select(s => new ChallengeSnippetDTO
                {
                    Id = s.Id,
                    Code = s.Code,
                    AnalysisType = s.AnalysisType,
                    AnalysisMessage = s.AnalysisMessage,
                    OrderIndex = s.OrderIndex
                }).ToList()
            };
        }
    }
}
