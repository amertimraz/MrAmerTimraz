using System.Net;
using System.Text.RegularExpressions;
using EduPlatform.API.Data;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Services;

/// <summary>
/// Serves the SPA shell with per-page title/description/Open Graph tags so that link previews
/// (Facebook, WhatsApp, Telegram...) show the real page name instead of the home page's. These
/// crawlers don't run JavaScript, so the tags must be in the HTML the server returns.
/// </summary>
public static class SpaSeo
{
    private const string Site = "https://www.amertimraz.com";
    private const string Brand = "منصة الأستاذ عامر تمراز";

    private static readonly Dictionary<string, (string Title, string Desc)> Pages = new(StringComparer.OrdinalIgnoreCase)
    {
        ["/assessments"] = ("التقييمات الأسبوعية محلولة", "التقييمات الأسبوعية والواجبات لكل الصفوف (من الرابع الابتدائي للأول الثانوي) بحلول الأستاذ عامر تمراز، مع تدريب تفاعلي وطباعة PDF."),
        ["/teachers"] = ("للمدرسين — مذكرات جاهزة", "مذكرات الكمبيوتر وتكنولوجيا المعلومات الجاهزة للمدرسين: اطّلع على عينات من كل مذكرة واطلب عرض سعر."),
        ["/reviews"] = ("المراجعات التفاعلية", "اختبارات مراجعة تفاعلية بالإجابة الفورية ولوحة الصدارة لكل مراحل التعليم في مادة الكمبيوتر."),
        ["/courses"] = ("الكورسات", "كورسات البرمجة والذكاء الاصطناعي والكمبيوتر لكل المراحل مع الأستاذ عامر تمراز."),
        ["/library"] = ("المكتبة", "مكتبة ملفات ومصادر تعليمية في الكمبيوتر وتكنولوجيا المعلومات."),
        ["/booklet-store"] = ("متجر المذكرات", "مذكرات الكمبيوتر وتكنولوجيا المعلومات للطلاب لكل الصفوف."),
        ["/about"] = ("عن الأستاذ عامر تمراز", "تعرّف على الأستاذ عامر تمراز ومنصته التعليمية للبرمجة والذكاء الاصطناعي."),
        ["/contact"] = ("تواصل معنا", "تواصل مع الأستاذ عامر تمراز للاستفسار عن الكورسات والمذكرات."),
        ["/services"] = ("خدماتنا", "خدمات منصة الأستاذ عامر تمراز التعليمية."),
    };

    private static readonly Dictionary<string, string> Stages = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Primary1"] = "الأول الابتدائي", ["Primary2"] = "الثاني الابتدائي", ["Primary3"] = "الثالث الابتدائي",
        ["Primary4"] = "الرابع الابتدائي", ["Primary5"] = "الخامس الابتدائي", ["Primary6"] = "السادس الابتدائي",
        ["Prep1"] = "الأول الإعدادي", ["Prep2"] = "الثاني الإعدادي", ["Prep3"] = "الثالث الإعدادي",
        ["Secondary1"] = "الأول الثانوي", ["Secondary2"] = "الثاني الثانوي", ["Secondary3"] = "الثالث الثانوي",
    };

    private static string? _shell;
    private static DateTime _shellStamp;

    public static async Task ServeAsync(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value ?? "/";
        var file = Path.Combine(ctx.RequestServices.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "wwwroot", "index.html");
        if (!File.Exists(file)) { ctx.Response.StatusCode = 404; return; }

        var stamp = File.GetLastWriteTimeUtc(file);
        if (_shell == null || stamp != _shellStamp)
        {
            _shell = await File.ReadAllTextAsync(file);
            _shellStamp = stamp;
        }

        var html = _shell;
        try
        {
            var meta = await ResolveAsync(ctx, path.TrimEnd('/') is { Length: > 0 } p ? p : "/");
            if (meta != null) html = Apply(html, meta.Value.Title, meta.Value.Desc, meta.Value.Image, Site + (path == "/" ? "/" : path.TrimEnd('/')));
        }
        catch
        {
            // SEO tags are best-effort: never break the page itself.
        }

        ctx.Response.ContentType = "text/html; charset=utf-8";
        ctx.Response.Headers["Cache-Control"] = "no-cache";
        await ctx.Response.WriteAsync(html);
    }

    private static async Task<(string Title, string Desc, string? Image)?> ResolveAsync(HttpContext ctx, string path)
    {
        if (Pages.TryGetValue(path, out var page)) return (page.Title, page.Desc, null);

        var parts = path.Trim('/').Split('/');
        if (parts.Length == 2 && parts[0].Equals("reviews", StringComparison.OrdinalIgnoreCase) && Stages.TryGetValue(parts[1], out var stage))
            return ($"مراجعات {stage}", $"اختبارات مراجعة تفاعلية لـ{stage} في الكمبيوتر وتكنولوجيا المعلومات: صح وغلط واختيار من متعدد بتصحيح فوري.", null);

        if (parts.Length == 2 && parts[0].Equals("teachers", StringComparison.OrdinalIgnoreCase) && int.TryParse(parts[1], out var id))
        {
            var db = ctx.RequestServices.GetRequiredService<AppDbContext>();
            var b = await db.Booklets.AsNoTracking()
                .Where(x => x.Id == id && x.IsPublished && x.TeacherShowcase)
                .Select(x => new { x.Title, x.TeacherSummary, x.CoverImageUrl })
                .FirstOrDefaultAsync();
            if (b != null)
            {
                var desc = string.IsNullOrWhiteSpace(b.TeacherSummary) ? "مذكرة جاهزة للمدرسين — اطّلع على العينات واطلب عرض سعر." : b.TeacherSummary!;
                var img = string.IsNullOrWhiteSpace(b.CoverImageUrl) ? null : (b.CoverImageUrl!.StartsWith("http") ? b.CoverImageUrl : Site + (b.CoverImageUrl.StartsWith("/") ? "" : "/") + b.CoverImageUrl);
                return (b.Title, desc.Length > 200 ? desc[..200] + "…" : desc, img);
            }
        }
        return null;
    }

    private static string Apply(string html, string title, string desc, string? image, string url)
    {
        var fullTitle = $"{title} | {Brand}";
        var t = WebUtility.HtmlEncode(fullTitle);
        var d = WebUtility.HtmlEncode(desc);

        html = Regex.Replace(html, "<title>.*?</title>", $"<title>{t}</title>", RegexOptions.Singleline);
        html = SetMeta(html, "name=\"description\"", d);
        html = SetMeta(html, "property=\"og:title\"", t);
        html = SetMeta(html, "property=\"og:description\"", d);
        html = SetMeta(html, "property=\"og:url\"", WebUtility.HtmlEncode(url));
        html = SetMeta(html, "name=\"twitter:title\"", t);
        html = SetMeta(html, "name=\"twitter:description\"", d);
        html = Regex.Replace(html, "<link rel=\"canonical\" href=\"[^\"]*\" />", $"<link rel=\"canonical\" href=\"{WebUtility.HtmlEncode(url)}\" />");
        if (!string.IsNullOrEmpty(image))
        {
            var i = WebUtility.HtmlEncode(image);
            html = SetMeta(html, "property=\"og:image\"", i);
            html = SetMeta(html, "name=\"twitter:image\"", i);
        }
        return html;
    }

    private static string SetMeta(string html, string attr, string value) =>
        Regex.Replace(html, $"(<meta {Regex.Escape(attr)} content=\")[^\"]*(\" />)", m => m.Groups[1].Value + value + m.Groups[2].Value);
}
