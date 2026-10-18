using EduPlatform.API.Assessments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssessmentsController : ControllerBase
{
    private readonly AssessmentCatalog _catalog;

    public AssessmentsController(AssessmentCatalog catalog)
    {
        _catalog = catalog;
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetCatalog() => Ok(new { tracks = _catalog.GetCatalog() });

    [HttpGet("{track}/{week:int}")]
    [AllowAnonymous]
    public IActionResult GetWeek(string track, int week)
    {
        var json = _catalog.GetContentJson(track, week);
        if (json == null) return NotFound("الحل المنسّق لهذا الأسبوع لم يُضف بعد");

        // The content files are already in the public API shape; serve them as-is.
        return Content(json, "application/json");
    }
}
