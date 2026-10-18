using System.Collections.Concurrent;
using System.Text.Json;

namespace EduPlatform.API.Assessments;

public record AssessmentTrack(string Key, string Stage, string StageLabel, string Subject, int Term, string UrlTemplate)
{
    public string UrlForWeek(int week) => string.Format(UrlTemplate, week);
}

public static class AssessmentTracks
{
    // Adding another grade/subject/term later = adding one entry here (+ its content folder).
    public static readonly IReadOnlyList<AssessmentTrack> All = new[]
    {
        new AssessmentTrack(
            "prep3-ict-t1", "Prep3", "الصف الثالث الإعدادي", "الكمبيوتر وتكنولوجيا المعلومات والاتصالات", 1,
            "https://elearnningcontent.blob.core.windows.net/elearnningcontent/2026_2027/Prepratory/Prepratory3/Term1/ClassrHomeAssessmentsTest/ICT_ARABIC_Prep3_TR1_W{0}.pdf"),
        new AssessmentTrack(
            "prep2-ict-t1", "Prep2", "الصف الثاني الإعدادي", "الكمبيوتر وتكنولوجيا المعلومات والاتصالات", 1,
            "https://elearnningcontent.blob.core.windows.net/elearnningcontent/2026_2027/Prepratory/Prepratory2/Term1/ClassrHomeAssessmentsTest/ICT_ARABIC_Prep2_TR1_W{0}.pdf"),
        new AssessmentTrack(
            "prep1-ict-t1", "Prep1", "الصف الأول الإعدادي", "الكمبيوتر وتكنولوجيا المعلومات والاتصالات", 1,
            "https://elearnningcontent.blob.core.windows.net/elearnningcontent/2026_2027/Prepratory/Prepratory1/Term1/ClassrHomeAssessmentsTest/ICT_ARABIC_Prep1_TR1_W{0}.pdf"),
        new AssessmentTrack(
            "sec1-ai-t1", "Sec1", "الصف الأول الثانوي", "البرمجة والذكاء الاصطناعي", 1,
            "https://elearnningcontent.blob.core.windows.net/elearnningcontent/2026_2027/Secondry/Secondry1/Term1/ClassrHomeAssessmentsTest/AI_AR_Sec1_TR1_W{0}.pdf"),
        new AssessmentTrack(
            "prim4-ict-t1", "Prim4", "الصف الرابع الابتدائي", "تكنولوجيا المعلومات والاتصالات", 1,
            "https://elearnningcontent.blob.core.windows.net/elearnningcontent/2026_2027/Primary/Primary4/Term1/ClassrHomeAssessmentsTest/ICT_ARABIC_Prim4_TR1_W{0}.pdf"),
        new AssessmentTrack(
            "prim5-ict-t1", "Prim5", "الصف الخامس الابتدائي", "تكنولوجيا المعلومات والاتصالات", 1,
            "https://elearnningcontent.blob.core.windows.net/elearnningcontent/2026_2027/Primary/Primary5/Term1/ClassrHomeAssessmentsTest/ICT_ARABIC_Prim5_TR1_W{0}.pdf"),
        new AssessmentTrack(
            "prim6-ict-t1", "Prim6", "الصف السادس الابتدائي", "تكنولوجيا المعلومات والاتصالات", 1,
            "https://elearnningcontent.blob.core.windows.net/elearnningcontent/2026_2027/Primary/Primary6/Term1/ClassrHomeAssessmentsTest/ICT_ARABIC_Prim6_TR1_W{0}.pdf")
    };
}

public record DiscoveredWeek(int Week, string Url, long? ContentLength, DateTimeOffset? LastModified);

public record AssessmentWeekSummary(
    int Week,
    string? Unit,
    string? Lesson,
    string SourceUrl,
    bool SourceAvailable,
    bool HasSolution,
    int ItemCount,
    DateTimeOffset? PublishedAt);

public record AssessmentTrackSummary(
    string Key, string Stage, string StageLabel, string Subject, int Term,
    IReadOnlyList<AssessmentWeekSummary> Weeks);

/// <summary>
/// Holds (1) the weeks discovered at the official source (refreshed by AssessmentWatcher) and
/// (2) the hand-verified, solved content shipped as JSON files with the app. A week that has been
/// discovered but has no JSON yet still shows up, as "official PDF only / solution coming soon".
/// </summary>
public class AssessmentCatalog
{
    private record ContentEntry(string RawJson, string? Unit, string? Lesson, int ItemCount);

    private readonly ConcurrentDictionary<(string Track, int Week), DiscoveredWeek> _discovered = new();
    private readonly Dictionary<(string Track, int Week), ContentEntry> _content = new();
    private readonly ILogger<AssessmentCatalog> _log;

    public AssessmentCatalog(IWebHostEnvironment env, ILogger<AssessmentCatalog> log)
    {
        _log = log;
        LoadContent(Path.Combine(env.ContentRootPath, "Assessments", "Content"));
    }

    private void LoadContent(string root)
    {
        if (!Directory.Exists(root))
        {
            _log.LogWarning("Assessments content folder not found: {Root}", root);
            return;
        }

        foreach (var file in Directory.EnumerateFiles(root, "week-*.json", SearchOption.AllDirectories))
        {
            try
            {
                var raw = File.ReadAllText(file);
                using var doc = JsonDocument.Parse(raw);
                var rootEl = doc.RootElement;
                var track = rootEl.GetProperty("track").GetString()!;
                var week = rootEl.GetProperty("week").GetInt32();
                var itemCount = rootEl.GetProperty("parts").EnumerateArray()
                    .Sum(p => p.GetProperty("items").GetArrayLength());

                _content[(track, week)] = new ContentEntry(
                    raw,
                    rootEl.TryGetProperty("unit", out var u) ? u.GetString() : null,
                    rootEl.TryGetProperty("lesson", out var l) ? l.GetString() : null,
                    itemCount);
            }
            catch (Exception ex)
            {
                // A malformed content file must never take the API down.
                _log.LogError(ex, "Skipping invalid assessment content file {File}", file);
            }
        }

        _log.LogInformation("Loaded {Count} assessment content files", _content.Count);
    }

    public int HighestKnownWeek(string track)
    {
        var fromDiscovery = _discovered.Keys.Where(k => k.Track == track).Select(k => k.Week);
        var fromContent = _content.Keys.Where(k => k.Track == track).Select(k => k.Week);
        return fromDiscovery.Concat(fromContent).DefaultIfEmpty(0).Max();
    }

    public void RecordDiscovered(string track, DiscoveredWeek week) => _discovered[(track, week.Week)] = week;

    public string? GetContentJson(string track, int week) =>
        _content.TryGetValue((track, week), out var c) ? c.RawJson : null;

    public IReadOnlyList<AssessmentTrackSummary> GetCatalog()
    {
        return AssessmentTracks.All.Select(track =>
        {
            var weeks = _discovered.Keys.Where(k => k.Track == track.Key).Select(k => k.Week)
                .Union(_content.Keys.Where(k => k.Track == track.Key).Select(k => k.Week))
                .OrderBy(w => w)
                .Select(week =>
                {
                    _discovered.TryGetValue((track.Key, week), out var found);
                    _content.TryGetValue((track.Key, week), out var content);
                    return new AssessmentWeekSummary(
                        week,
                        content?.Unit,
                        content?.Lesson,
                        found?.Url ?? track.UrlForWeek(week),
                        found != null,
                        content != null,
                        content?.ItemCount ?? 0,
                        found?.LastModified);
                })
                .ToList();

            return new AssessmentTrackSummary(track.Key, track.Stage, track.StageLabel, track.Subject, track.Term, weeks);
        }).ToList();
    }
}
