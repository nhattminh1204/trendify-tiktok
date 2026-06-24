using Trendify.Shared.Domain;

namespace Trendify.Modules.Accounts.Domain;

public sealed class UserRefreshToken : TenantEntity
{
    public Guid UserId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;
    public bool IsActive => RevokedAt == null && !IsExpired;

    private UserRefreshToken() { }

    public static UserRefreshToken Create(Guid userId, Guid tenantId, string token, int ttlDays)
    {
        return new UserRefreshToken
        {
            UserId = userId,
            TenantId = tenantId,
            Token = token,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(ttlDays),
        };
    }

    public void Revoke()
    {
        RevokedAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }
}
