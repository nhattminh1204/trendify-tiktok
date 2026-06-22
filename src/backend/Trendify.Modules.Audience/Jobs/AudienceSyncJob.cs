using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.Auth;
using Trendify.Infrastructure.Persistence;
using Trendify.Infrastructure.TikTok;
using Trendify.Modules.Accounts.Domain;
using Trendify.Modules.Audience.Domain;
using Trendify.Modules.Audience.Infrastructure;

namespace Trendify.Modules.Audience.Jobs;

/// <summary>
/// Syncs follower stats + basic demographics from TikTok for all active accounts.
/// Scheduled by Hangfire every 6 hours.
/// </summary>
public sealed class AudienceSyncJob
{
    private readonly AppDbContext _db;
    private readonly TikTokApiClient _tikTok;
    private readonly TokenEncryptionService _encryption;
    private readonly IAudienceRepository _repo;
    private readonly ILogger<AudienceSyncJob> _logger;

    public AudienceSyncJob(
        AppDbContext db,
        TikTokApiClient tikTok,
        TokenEncryptionService encryption,
        IAudienceRepository repo,
        ILogger<AudienceSyncJob> logger)
    {
        _db = db;
        _tikTok = tikTok;
        _encryption = encryption;
        _repo = repo;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        // Cross-module EF read: SocialAccount is owned by Accounts module.
        // Acceptable in modular monolith — no service import, just shared DB context.
        var accounts = await _db.Set<SocialAccount>()
            .Where(a => a.IsActive && a.Status == "active" && a.AccessTokenEncrypted != null)
            .ToListAsync(ct);

        _logger.LogInformation(
            "AudienceSyncJob: syncing {Count} accounts", accounts.Count);

        foreach (var account in accounts)
        {
            try
            {
                await SyncAccountAsync(account, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "AudienceSyncJob failed for SocialAccount {Id}", account.Id);
            }
        }
    }

    private async Task SyncAccountAsync(SocialAccount account, CancellationToken ct)
    {
        var accessToken = _encryption.Decrypt(account.AccessTokenEncrypted!);
        var stats = await _tikTok.GetUserStatsAsync(accessToken, ct);
        if (stats is null) return;

        var profile = await _repo.GetProfileAsync(account.TenantId, account.Id, ct);

        if (profile is null)
        {
            profile = AudienceProfile.Create(account.TenantId, account.Id, niche: "general");
            await _repo.AddProfileAsync(profile, ct);
        }

        // Build geo distribution from account display name country (stub — full demographics
        // require TikTok Creator Marketplace API with Business account)
        var geoJson = JsonDocument.Parse("[]");
        var ageJson = JsonDocument.Parse("[]");
        var hoursJson = JsonDocument.Parse("[]");

        profile.Update(
            followers: stats.follower_count,
            avgEngagementRate: stats.likes_count > 0 && stats.video_count > 0
                ? (decimal)stats.likes_count / stats.video_count / stats.follower_count
                : 0m,
            topInterests: [],
            ageDistribution: ageJson,
            geoDistribution: geoJson,
            activeHours: hoursJson
        );

        // Also update the SocialAccount follower count + sync timestamp
        account.Sync(stats.display_name, stats.avatar_url, stats.follower_count);

        await _repo.SaveChangesAsync(ct);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "AudienceSyncJob: synced account {Id} — {Followers} followers",
            account.Id, stats.follower_count);
    }
}
