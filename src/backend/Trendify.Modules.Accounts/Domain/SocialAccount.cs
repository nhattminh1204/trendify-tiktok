using Trendify.Shared.Domain;

namespace Trendify.Modules.Accounts.Domain;

public sealed class SocialAccount : TenantEntity
{
    public string Platform { get; private set; } = string.Empty;
    public string PlatformUserId { get; private set; } = string.Empty;
    public string Username { get; private set; } = string.Empty;
    public string? DisplayName { get; private set; }
    public string? ProfileImageUrl { get; private set; }
    public string? AccessTokenEncrypted { get; private set; }
    public string? RefreshTokenEncrypted { get; private set; }
    public DateTimeOffset? TokenExpiresAt { get; private set; }
    public long FollowerCount { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTimeOffset? LastSyncedAt { get; private set; }
    public string Status { get; private set; } = "active";

    private SocialAccount() { }

    public static SocialAccount Connect(
        Guid tenantId,
        string platform,
        string platformUserId,
        string username,
        string? displayName,
        string? profileImageUrl,
        string accessTokenEncrypted,
        string refreshTokenEncrypted,
        DateTimeOffset tokenExpiresAt,
        long followerCount)
    {
        return new SocialAccount
        {
            TenantId = tenantId,
            Platform = platform,
            PlatformUserId = platformUserId,
            Username = username,
            DisplayName = displayName,
            ProfileImageUrl = profileImageUrl,
            AccessTokenEncrypted = accessTokenEncrypted,
            RefreshTokenEncrypted = refreshTokenEncrypted,
            TokenExpiresAt = tokenExpiresAt,
            FollowerCount = followerCount,
            Status = "active"
        };
    }

    public void UpdateTokens(
        string accessTokenEncrypted,
        string refreshTokenEncrypted,
        DateTimeOffset expiresAt)
    {
        AccessTokenEncrypted = accessTokenEncrypted;
        RefreshTokenEncrypted = refreshTokenEncrypted;
        TokenExpiresAt = expiresAt;
        Status = "active";
        MarkUpdated();
    }

    public void MarkTokenExpired()
    {
        Status = "token_expired";
        MarkUpdated();
    }

    public void Sync(string? displayName, string? profileImageUrl, long followerCount)
    {
        DisplayName = displayName;
        ProfileImageUrl = profileImageUrl;
        FollowerCount = followerCount;
        LastSyncedAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }

    public void Disconnect()
    {
        IsActive = false;
        AccessTokenEncrypted = null;
        RefreshTokenEncrypted = null;
        Status = "disconnected";
        MarkUpdated();
    }

    public bool IsTokenExpired => TokenExpiresAt.HasValue && TokenExpiresAt.Value < DateTimeOffset.UtcNow;
}
