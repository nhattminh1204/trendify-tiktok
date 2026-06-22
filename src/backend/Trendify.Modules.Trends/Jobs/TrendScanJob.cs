using Microsoft.Extensions.Logging;
using Trendify.Modules.Trends.Application.Services;
using Trendify.Modules.Trends.Domain;
using Trendify.Modules.Trends.Infrastructure;

namespace Trendify.Modules.Trends.Jobs;

// Registered in Program.cs via Hangfire: RecurringJob.AddOrUpdate every 30 minutes
public sealed class TrendScanJob
{
    private readonly ITrendsRepository _repo;
    private readonly TrendScoringService _scoring;
    private readonly ILogger<TrendScanJob> _logger;

    public TrendScanJob(
        ITrendsRepository repo,
        TrendScoringService scoring,
        ILogger<TrendScanJob> logger)
    {
        _repo = repo;
        _scoring = scoring;
        _logger = logger;
    }

    public async Task ExecuteAsync(Guid tenantId, string niche, CancellationToken ct = default)
    {
        _logger.LogInformation("TrendScanJob started. TenantId={TenantId} Niche={Niche}", tenantId, niche);

        // Phase 1: score simulation (Phase 2 will call real TikTok Trending API)
        var simulatedKeywords = _scoring.SimulateKeywords(niche);

        foreach (var kw in simulatedKeywords)
        {
            var exists = await _repo.ExistsAsync(tenantId, kw.Keyword, "tiktok", ct);
            if (exists) continue;

            var trend = TrendDetection.Detect(
                tenantId: tenantId,
                keyword: kw.Keyword,
                niche: niche,
                platform: "tiktok",
                velocityScore: kw.VelocityScore,
                volumeScore: kw.VolumeScore,
                engagementScore: kw.EngagementScore,
                recencyScore: kw.RecencyScore
            );

            await _repo.AddAsync(trend, ct);
        }

        await _repo.SaveChangesAsync(ct);
        _logger.LogInformation("TrendScanJob completed. TenantId={TenantId} Found={Count}",
            tenantId, simulatedKeywords.Count);
    }
}
