using System.Net;

namespace EduPlatform.API.Assessments;

/// <summary>
/// Periodically checks the official source for new weekly assessment PDFs. Weeks are published
/// sequentially (…_W1.pdf, …_W2.pdf), so each run re-probes from week 1 and stops after a few
/// consecutive misses beyond the highest week we already know about. Only cheap HEAD requests.
/// </summary>
public class AssessmentWatcher : BackgroundService
{
    private const int MaxWeeks = 30;
    private const int MissesBeforeStop = 3;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(3);

    private readonly AssessmentCatalog _catalog;
    private readonly IHttpClientFactory _httpFactory;
    private readonly ILogger<AssessmentWatcher> _log;

    public AssessmentWatcher(AssessmentCatalog catalog, IHttpClientFactory httpFactory, ILogger<AssessmentWatcher> log)
    {
        _catalog = catalog;
        _httpFactory = httpFactory;
        _log = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            using var timer = new PeriodicTimer(Interval);
            do
            {
                await ProbeAllAsync(stoppingToken);
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException)
        {
            // shutting down
        }
    }

    private async Task ProbeAllAsync(CancellationToken ct)
    {
        try
        {
            var http = _httpFactory.CreateClient();
            http.Timeout = TimeSpan.FromSeconds(10);
            http.DefaultRequestHeaders.UserAgent.ParseAdd("AmerTimrazPlatform/1.0 (+https://amertimraz.com)");

            foreach (var track in AssessmentTracks.All)
            {
                var knownHighest = _catalog.HighestKnownWeek(track.Key);
                var misses = 0;
                var found = 0;

                for (var week = 1; week <= MaxWeeks; week++)
                {
                    ct.ThrowIfCancellationRequested();
                    var url = track.UrlForWeek(week);

                    try
                    {
                        using var req = new HttpRequestMessage(HttpMethod.Head, url);
                        using var res = await http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);

                        if (res.IsSuccessStatusCode)
                        {
                            misses = 0;
                            found++;
                            _catalog.RecordDiscovered(track.Key,
                                new DiscoveredWeek(week, url, res.Content.Headers.ContentLength, res.Content.Headers.LastModified));
                        }
                        else if (res.StatusCode == HttpStatusCode.NotFound)
                        {
                            misses++;
                            if (week > knownHighest && misses >= MissesBeforeStop) break;
                        }
                        // any other status: keep whatever we knew before, don't count as a miss
                    }
                    catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
                    {
                        _log.LogWarning("Assessment probe failed for {Url}: {Message}", url, ex.Message);
                        break; // source unreachable right now; keep previous state and retry next run
                    }
                }

                _log.LogInformation("Assessment probe {Track}: {Found} week(s) available at source", track.Key, found);
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Assessment probe run failed");
        }
    }
}
