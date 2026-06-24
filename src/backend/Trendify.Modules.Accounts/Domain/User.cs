using Trendify.Shared.Domain;

namespace Trendify.Modules.Accounts.Domain;

public sealed class User : TenantEntity
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string Role { get; private set; } = "owner";
    public bool IsActive { get; private set; } = true;
    public DateTimeOffset? LastLoginAt { get; private set; }
    public string? Status { get; private set; }

    // Transient — latest token data for API responses
    // Persisted in user_refresh_tokens table, managed by repository
    [System.Text.Json.Serialization.JsonIgnore]
    public string? LatestRefreshToken { get; private set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public DateTimeOffset? LatestRefreshTokenExpiresAt { get; private set; }

    private User() { }

    public static User Create(Guid tenantId, string email, string passwordHash, string displayName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);

        return new User
        {
            TenantId = tenantId,
            Email = email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHash,
            DisplayName = displayName.Trim(),
            Role = "owner"
        };
    }

    public bool VerifyPassword(string password) =>
        BCrypt.Net.BCrypt.Verify(password, PasswordHash);

    public UserRefreshToken SetRefreshToken(string token, int ttlDays)
    {
        LatestRefreshToken = token;
        LatestRefreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(ttlDays);
        MarkUpdated();
        return UserRefreshToken.Create(Id, TenantId, token, ttlDays);
    }

    public void ClearLocalRefreshToken()
    {
        LatestRefreshToken = null;
        LatestRefreshTokenExpiresAt = null;
        MarkUpdated();
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }

    public void UpdateDisplayName(string name)
    {
        DisplayName = name.Trim();
        MarkUpdated();
    }

    public void MarkTokenExpired()
    {
        Status = "token_expired";
        MarkUpdated();
    }

    public void ClearExpiredStatus()
    {
        if (Status == "token_expired")
            Status = null;
        MarkUpdated();
    }

    public static string HashPassword(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
}
