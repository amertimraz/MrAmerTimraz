using System.Data;
using System.Data.Common;
using EduPlatform.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

/// <summary>
/// Tiny page-visit counter. Uses plain SQL that works on both SQLite and PostgreSQL so it needs
/// no EF migration: the table is created on first use.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class VisitsController : ControllerBase
{
    private static readonly string[] AllowedPages = { "assessments" };
    private static volatile bool _tableReady;
    private static readonly SemaphoreSlim Gate = new(1, 1);

    private readonly AppDbContext _db;

    public VisitsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("{page}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get(string page)
    {
        if (!AllowedPages.Contains(page)) return NotFound();
        await EnsureTableAsync();
        return Ok(new { count = await ReadAsync(page) });
    }

    [HttpPost("{page}")]
    [AllowAnonymous]
    public async Task<IActionResult> Hit(string page)
    {
        if (!AllowedPages.Contains(page)) return NotFound();
        await EnsureTableAsync();

        var conn = _db.Database.GetDbConnection();
        var wasClosed = conn.State != ConnectionState.Open;
        if (wasClosed) await conn.OpenAsync();
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText =
                "INSERT INTO page_visits (page, total) VALUES (@p, 1) " +
                "ON CONFLICT (page) DO UPDATE SET total = page_visits.total + 1";
            AddParam(cmd, "@p", page);
            await cmd.ExecuteNonQueryAsync();
        }
        finally
        {
            if (wasClosed) await conn.CloseAsync();
        }

        return Ok(new { count = await ReadAsync(page) });
    }

    private async Task EnsureTableAsync()
    {
        if (_tableReady) return;
        await Gate.WaitAsync();
        try
        {
            if (_tableReady) return;
            await _db.Database.ExecuteSqlRawAsync(
                "CREATE TABLE IF NOT EXISTS page_visits (page VARCHAR(64) PRIMARY KEY, total BIGINT NOT NULL DEFAULT 0)");
            _tableReady = true;
        }
        finally
        {
            Gate.Release();
        }
    }

    private async Task<long> ReadAsync(string page)
    {
        var conn = _db.Database.GetDbConnection();
        var wasClosed = conn.State != ConnectionState.Open;
        if (wasClosed) await conn.OpenAsync();
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT total FROM page_visits WHERE page = @p";
            AddParam(cmd, "@p", page);
            var result = await cmd.ExecuteScalarAsync();
            return result == null || result is DBNull ? 0 : Convert.ToInt64(result);
        }
        finally
        {
            if (wasClosed) await conn.CloseAsync();
        }
    }

    private static void AddParam(DbCommand cmd, string name, object value)
    {
        var p = cmd.CreateParameter();
        p.ParameterName = name;
        p.Value = value;
        cmd.Parameters.Add(p);
    }
}
