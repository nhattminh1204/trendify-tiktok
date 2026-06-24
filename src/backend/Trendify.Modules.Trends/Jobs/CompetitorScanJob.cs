using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.TikTok;
using Trendify.Modules.Trends.Application.Services;
using Trendify.Modules.Trends.Domain;
using Trendify.Modules.Trends.Infrastructure;

namespace Trendify.Modules.Trends.Jobs;

public sealed class CompetitorScanJob
{
    private readonly ITrendsRepository _repo;
    private readonly TrendScoringService _scoring;
    private readonly TikTokApiClient _tiktok;
    private readonly ILogger<CompetitorScanJob> _logger;

    public CompetitorScanJob(
        ITrendsRepository repo,
        TrendScoringService scoring,
        TikTokApiClient tiktok,
        ILogger<CompetitorScanJob> logger)
    {
        _repo = repo;
        _scoring = scoring;
        _tiktok = tiktok;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var competitors = await _repo.GetAllCompetitorsAsync(ct);

        _logger.LogInformation(
            "CompetitorScanJob started. Scanning {Count} competitors", competitors.Count);

        foreach (var competitor in competitors)
        {
            try
            {
                await ScanCompetitorAsync(competitor, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to scan competitor {Username}", competitor.TikTokUsername);
            }
        }
    }

    private async Task ScanCompetitorAsync(CompetitorProfile competitor, CancellationToken ct)
    {
        // Phase 1: Simulated — extract keywords from competitor name
        var keywords = _scoring.SimulateKeywords("general");

        foreach (var kw in keywords)
        {
            var exists = await _repo.ExistsAsync(competitor.TenantId, kw.Keyword, "tiktok", ct);
            if (exists) continue;

            var trend = TrendDetection.Detect(
                tenantId: competitor.TenantId,
                keyword: $"{competitor.TikTokUsername} {kw.Keyword}",
                niche: "general",
                platform: "tiktok",
                velocityScore: kw.VelocityScore * 0.8m,
                volumeScore: kw.VolumeScore * 0.8m,
                engagementScore: kw.EngagementScore * 0.8m,
                recencyScore: kw.RecencyScore
            );

            await _repo.AddAsync(trend, ct);
        }

        competitor.MarkScanned();
        await _repo.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Scanned competitor @{Username}, found {Count} trends",
            competitor.TikTokUsername, keywords.Count);
    }
}
