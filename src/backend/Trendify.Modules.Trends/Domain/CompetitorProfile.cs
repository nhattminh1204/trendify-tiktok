using Trendify.Shared.Domain;

namespace Trendify.Modules.Trends.Domain;

public sealed class CompetitorProfile : TenantEntity
{
    public string TikTokUsername { get; private set; } = string.Empty;
    public string? DisplayName { get; private set; }
    public string? AvatarUrl { get; private set; }
    public long? FollowerCount { get; private set; }
    public string? Notes { get; private set; }
    public DateTimeOffset? LastScannedAt { get; private set; }

    private CompetitorProfile() { }

    public static CompetitorProfile Create(
        Guid tenantId,
        string tiktokUsername,
        string? notes = null)
    {
        return new CompetitorProfile
        {
            TenantId = tenantId,
            TikTokUsername = tiktokUsername.TrimStart('@'),
            Notes = notes?.Trim()
        };
    }

    public void UpdateProfile(string? displayName, string? avatarUrl, long? followerCount)
    {
        DisplayName = displayName;
        AvatarUrl = avatarUrl;
        FollowerCount = followerCount;
        MarkUpdated();
    }

    public void UpdateNotes(string? notes)
    {
        Notes = notes?.Trim();
        MarkUpdated();
    }

    public void MarkScanned()
    {
        LastScannedAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }
}
