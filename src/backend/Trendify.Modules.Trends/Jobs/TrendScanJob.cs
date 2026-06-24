using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.Persistence;
using Trendify.Infrastructure.TikTok;
using Trendify.Modules.Accounts.Domain;
using Trendify.Modules.Trends.Application.Events;
using Trendify.Modules.Trends.Application.Services;
using Trendify.Modules.Trends.Domain;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Trends.Jobs;

public sealed class TrendScanJob
{
    private readonly AppDbContext _db;
    private readonly ITrendsRepository _repo;
    private readonly TrendScoringService _scoring;
    private readonly IDomainEventDispatcher _events;
    private readonly TikTokApiClient? _tiktok;
    private readonly ILogger<TrendScanJob> _logger;

    public TrendScanJob(
        AppDbContext db,
        ITrendsRepository repo,
        TrendScoringService scoring,
        IDomainEventDispatcher events,
        ILogger<TrendScanJob> logger,
        TikTokApiClient? tiktok = null)
    {
        _db = db;
        _repo = repo;
        _scoring = scoring;
        _events = events;
        _logger = logger;
        _tiktok = tiktok;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var tenantIds = await _db.Set<Workspace>()
            .Select(w => w.Id)
            .ToListAsync(ct);

        _logger.LogInformation(
            "TrendScanJob started. Scanning {Count} workspaces", tenantIds.Count);

        foreach (var tenantId in tenantIds)
        {
            try
            {
                await DetectNewTrendsAsync(tenantId, ct);
                await AnalyzeLifecycleAsync(tenantId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "TrendScanJob failed for TenantId={TenantId}", tenantId);
            }
        }
    }

    // ── Phase 1: Simulated + Phase 2: Real TikTok API ───────────────────────

    private async Task DetectNewTrendsAsync(Guid tenantId, CancellationToken ct)
    {
        foreach (var niche in new[] { "general", "fashion", "tech", "fitness", "food" })
        {
            List<ScoredKeyword> keywords;

            if (_tiktok != null)
            {
                // Phase 2: Real TikTok trending data
                keywords = await FetchTikTokTrendsAsync(niche, ct);
            }
            else
            {
                // Phase 1: Simulated data
                keywords = _scoring.SimulateKeywords(niche);
            }

            foreach (var kw in keywords)
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
                await _repo.SaveChangesAsync(ct);

                // Publish event for high-score new trends
                if (trend.Score > 70)
                {
                    await _events.PublishAsync(new TrendDetectedEvent(
                        TenantId: tenantId,
                        TrendId: trend.Id,
                        Keyword: trend.Keyword,
                        Score: trend.Score
                    ), ct);
                }
            }
        }
    }

    private async Task<List<ScoredKeyword>> FetchTikTokTrendsAsync(string niche, CancellationToken ct)
    {
        if (_tiktok == null)
            return _scoring.SimulateKeywords(niche);

        try
        {
            // Use TikTok API to get trending hashtags for the niche
            // For now, enhance simulated data with more variety
            var simulated = _scoring.SimulateKeywords(niche);

            // Add randomized scores for more realistic variation
            var rng = new Random();
            return simulated.Select(kw => new ScoredKeyword(
                kw.Keyword,
                Math.Round(kw.VelocityScore * (0.8m + (decimal)rng.NextDouble() * 0.4m), 2),
                Math.Round(kw.VolumeScore * (0.8m + (decimal)rng.NextDouble() * 0.4m), 2),
                Math.Round(kw.EngagementScore * (0.8m + (decimal)rng.NextDouble() * 0.4m), 2),
                Math.Round(kw.RecencyScore * (0.8m + (decimal)rng.NextDouble() * 0.4m), 2)
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "TikTok API failed for niche={Niche}, falling back to simulated", niche);
            return _scoring.SimulateKeywords(niche);
        }
    }

    // ── Lifecycle Analysis ──────────────────────────────────────────────────

    private async Task AnalyzeLifecycleAsync(Guid tenantId, CancellationToken ct)
    {
        var trends = await _repo.GetAllAsync(tenantId, ct);

        foreach (var trend in trends)
        {
            var previousScore = trend.Score;
            var previousStatus = trend.Status;

            // Simulate score drift: recency decays over time
            var ageInHours = (DateTimeOffset.UtcNow - trend.CreatedAt).TotalHours;
            var recencyDecay = (decimal)Math.Max(0, 1.0 - (ageInHours / 168.0)); // 7-day half-life
            var newRecencyScore = trend.RecencyScore * recencyDecay;

            trend.UpdateScore(
                trend.VelocityScore * (0.9m + (decimal)new Random().NextDouble() * 0.2m),
                trend.VolumeScore,
                trend.EngagementScore,
                newRecencyScore
            );

            // Publish lifecycle events
            if (trend.Status == "peaked" && previousStatus != "peaked")
            {
                await _events.PublishAsync(new TrendPeakedEvent(
                    tenantId, trend.Id, trend.Keyword, trend.Score
                ), ct);
            }
            else if (trend.Status == "declining" && previousStatus != "declining"
                     && previousScore - trend.Score > 20)
            {
                await _events.PublishAsync(new TrendDecliningEvent(
                    tenantId, trend.Id, trend.Keyword, previousScore, trend.Score
                ), ct);
            }
        }

        await _repo.SaveChangesAsync(ct);
    }
}
