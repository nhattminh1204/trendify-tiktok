using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.Auth;
using Trendify.Infrastructure.Persistence;
using Trendify.Infrastructure.TikTok;
using Trendify.Modules.Accounts.Domain;
using Trendify.Modules.Analytics.Domain;
using Trendify.Modules.Analytics.Infrastructure;

namespace Trendify.Modules.Analytics.Jobs;

/// <summary>
/// Fetches video metrics from TikTok API and appends PostMetrics records.
/// Scheduled by Hangfire every 3 hours.
/// De-duplicates by checking if a record was already captured today.
/// </summary>
public sealed class AnalyticsSyncJob
{
    private readonly AppDbContext _db;
    private readonly TikTokApiClient _tikTok;
    private readonly TokenEncryptionService _encryption;
    private readonly IAnalyticsRepository _repo;
    private readonly ILogger<AnalyticsSyncJob> _logger;

    public AnalyticsSyncJob(
        AppDbContext db,
        TikTokApiClient tikTok,
        TokenEncryptionService encryption,
        IAnalyticsRepository repo,
        ILogger<AnalyticsSyncJob> logger)
    {
        _db = db;
        _tikTok = tikTok;
        _encryption = encryption;
        _repo = repo;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var accounts = await _db.Set<SocialAccount>()
            .Where(a => a.IsActive && a.Status == "active" && a.AccessTokenEncrypted != null)
            .ToListAsync(ct);

        _logger.LogInformation(
            "AnalyticsSyncJob: syncing {Count} accounts", accounts.Count);

        foreach (var account in accounts)
        {
            try
            {
                await SyncAccountAsync(account, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "AnalyticsSyncJob failed for SocialAccount {Id}", account.Id);
            }
        }
    }

    private async Task SyncAccountAsync(SocialAccount account, CancellationToken ct)
    {
        var accessToken = _encryption.Decrypt(account.AccessTokenEncrypted!);
        var videos = await _tikTok.GetVideosAsync(accessToken, maxCount: 20, ct);

        if (videos.Count == 0) return;

        var inserted = 0;
        foreach (var video in videos)
        {
            // Deterministic PostId: MD5(tenantId:tiktokVideoId) → stable Guid per video
            var postId = DeterministicPostId(account.TenantId, video.id);

            // Skip if already recorded metrics today to avoid duplicate inserts
            var latest = await _repo.GetLatestAsync(account.TenantId, postId, ct);
            if (latest?.RecordedAt.Date == DateTimeOffset.UtcNow.Date)
                continue;

            var metrics = PostMetrics.Record(
                tenantId: account.TenantId,
                postId: postId,
                views: video.view_count,
                likes: video.like_count,
                comments: video.comment_count,
                shares: video.share_count,
                saves: 0,                   // TikTok v2 basic API doesn't expose saves
                watchTimeSeconds: 0,        // requires TikTok Analytics API (Business)
                revenueUsd: 0
            );

            await _repo.AddAsync(metrics, ct);
            inserted++;
        }

        if (inserted > 0)
            await _repo.SaveChangesAsync(ct);

        _logger.LogInformation(
            "AnalyticsSyncJob: account {Id} — {Inserted}/{Total} new metric records",
            account.Id, inserted, videos.Count);
    }

    private static Guid DeterministicPostId(Guid tenantId, string tiktokVideoId)
    {
        var input = $"{tenantId}:{tiktokVideoId}";
        var hash = MD5.HashData(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
