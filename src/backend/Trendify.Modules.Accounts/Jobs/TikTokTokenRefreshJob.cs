using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.Auth;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Accounts.Domain;
using Trendify.Modules.Accounts.Infrastructure.TikTok;

namespace Trendify.Modules.Accounts.Jobs;

/// <summary>
/// Refreshes TikTok access tokens that expire within the next 2 hours.
/// Scheduled by Hangfire every 30 minutes.
/// </summary>
public sealed class TikTokTokenRefreshJob
{
    private readonly AppDbContext _db;
    private readonly TikTokOAuthService _tikTok;
    private readonly ILogger<TikTokTokenRefreshJob> _logger;

    public TikTokTokenRefreshJob(
        AppDbContext db,
        TikTokOAuthService tikTok,
        ILogger<TikTokTokenRefreshJob> logger)
    {
        _db = db;
        _tikTok = tikTok;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var threshold = DateTimeOffset.UtcNow.AddHours(2);

        var expiring = await _db.Set<SocialAccount>()
            .Where(a => a.IsActive
                     && a.Status == "active"
                     && a.RefreshTokenEncrypted != null
                     && a.TokenExpiresAt != null
                     && a.TokenExpiresAt < threshold)
            .ToListAsync(ct);

        _logger.LogInformation(
            "TikTokTokenRefreshJob: found {Count} accounts needing refresh", expiring.Count);

        foreach (var account in expiring)
        {
            try
            {
                await _tikTok.RefreshAccessTokenAsync(
                    account.RefreshTokenEncrypted!,
                    (newAccess, newRefresh, expiresAt) =>
                        account.UpdateTokens(newAccess, newRefresh, expiresAt),
                    ct);

                _logger.LogInformation(
                    "Refreshed token for SocialAccount {Id} (tenant {TenantId})",
                    account.Id, account.TenantId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to refresh token for SocialAccount {Id} — marking expired",
                    account.Id);
                account.MarkTokenExpired();
            }
        }

        if (expiring.Count > 0)
            await _db.SaveChangesAsync(ct);
    }
}
