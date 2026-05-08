using EduPlatform.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;

namespace EduPlatform.API.Controllers
{
    [ApiController]
    [Route("api/database-fix")]
    public class DatabaseFixController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _sqlFixesPath;

        public DatabaseFixController(AppDbContext context)
        {
            _context = context;
            _sqlFixesPath = Path.Combine(Directory.GetCurrentDirectory(), "Fixes");
        }

        [HttpPost("apply-tofas-fixes")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApplyTofasFixes()
        {
            try
            {
                var result = new { success = true, message = "", fixesApplied = 0 };

                // Apply complete fixes
                var completeFixPath = Path.Combine(_sqlFixesPath, "fix_tofas_level2_complete.sql");
                if (System.IO.File.Exists(completeFixPath))
                {
                    var completeSql = await System.IO.File.ReadAllTextAsync(completeFixPath);
                    await _context.Database.ExecuteSqlRawAsync(completeSql);
                    result.fixesApplied++;
                }

                // Apply reversed format fixes
                var reversedFixPath = Path.Combine(_sqlFixesPath, "fix_tofas_level2_reversed.sql");
                if (System.IO.File.Exists(reversedFixPath))
                {
                    var reversedSql = await System.IO.File.ReadAllTextAsync(reversedFixPath);
                    await _context.Database.ExecuteSqlRawAsync(reversedSql);
                    result.fixesApplied++;
                }

                result.message = $"Successfully applied {result.fixesApplied} fix files";
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("check-tofas-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CheckTofasStatus()
        {
            try
            {
                // Check for incomplete snippets
                var incompleteSnippets = await _context.ChallengeSnippets
                    .Join(_context.Challenges, cs => cs.ChallengeId, c => c.Id, (cs, c) => new { cs, c })
                    .Where(x => x.c.TestId == 2 && x.cs.Code.Contains("..."))
                    .CountAsync();

                // Check for short snippets (likely output only)
                var shortSnippets = await _context.ChallengeSnippets
                    .Join(_context.Challenges, cs => cs.ChallengeId, c => c.Id, (cs, c) => new { cs, c })
                    .Where(x => x.c.TestId == 2 && x.cs.Code.Length < 50)
                    .CountAsync();

                // Check for questions with code in description
                var questionsWithCode = await _context.Challenges
                    .Where(c => c.TestId == 2 && c.Description.Contains("```javascript"))
                    .CountAsync();

                return Ok(new
                {
                    incompleteSnippets,
                    shortSnippets,
                    questionsWithCode,
                    totalQuestions = await _context.Challenges.Where(c => c.TestId == 2).CountAsync(),
                    totalSnippets = await _context.ChallengeSnippets
                        .Join(_context.Challenges, cs => cs.ChallengeId, c => c.Id, (cs, c) => new { cs, c })
                        .Where(x => x.c.TestId == 2)
                        .CountAsync()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("apply-custom-sql")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApplyCustomSql([FromBody] string sql)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(sql);
                return Ok(new { success = true, message = "SQL executed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
