using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeacherPackagesController : ControllerBase
{
    private readonly AppDbContext _db;

    public TeacherPackagesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(bool all = false)
    {
        try
        {
            var query = _db.TeacherPackages.AsQueryable();

            if (!all || !User.IsInRole("Admin"))
                query = query.Where(p => p.IsPublished);

            var packages = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
            return Ok(packages);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في استرجاع الباكدجات", details = msg });
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var package = await _db.TeacherPackages.FindAsync(id);
        if (package == null || (!package.IsPublished && !User.IsInRole("Admin")))
            return NotFound("الباكدج غير موجود");

        return Ok(package);
    }

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(TeacherPackageDto dto)
    {
        try
        {
            var package = new TeacherPackage
            {
                Title = dto.Title,
                Description = dto.Description,
                CoverImageUrl = dto.CoverImageUrl,
                SampleFileUrl = dto.SampleFileUrl,
                Price = dto.Price,
                IsPublished = dto.IsPublished,
                CreatedAt = DateTime.UtcNow
            };

            _db.TeacherPackages.Add(package);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = package.Id }, package);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في حفظ الباكدج", details = msg });
        }
    }

    [HttpPut("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, TeacherPackageDto dto)
    {
        try
        {
            var package = await _db.TeacherPackages.FindAsync(id);
            if (package == null) return NotFound("الباكدج غير موجود");

            package.Title = dto.Title;
            package.Description = dto.Description;
            package.CoverImageUrl = dto.CoverImageUrl;
            package.SampleFileUrl = dto.SampleFileUrl;
            package.Price = dto.Price;
            package.IsPublished = dto.IsPublished;

            await _db.SaveChangesAsync();
            return Ok(package);
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
            return StatusCode(500, new { error = "خطأ في تحديث الباكدج", details = msg });
        }
    }

    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var package = await _db.TeacherPackages.FindAsync(id);
        if (package == null) return NotFound("الباكدج غير موجود");

        _db.TeacherPackages.Remove(package);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
