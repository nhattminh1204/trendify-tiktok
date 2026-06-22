using System.Text.Json;
using Trendify.Shared.Domain;

namespace Trendify.Modules.Audience.Domain;

public sealed class AudienceProfile : TenantEntity
{
    public Guid SocialAccountId { get; private set; }
    public string Niche { get; private set; } = string.Empty;
    public long TotalFollowers { get; private set; }
    public decimal AvgEngagementRate { get; private set; }

    // Top age brackets — JSONB: [{"bracket":"18-24","percent":45.2}, ...]
    public JsonDocument? AgeDistribution { get; private set; }

    // JSONB: [{"country":"VN","percent":60.5}, ...]
    public JsonDocument? GeoDistribution { get; private set; }

    // active_hours: JSONB [{"hour":20,"score":0.9}, ...]
    public JsonDocument? ActiveHours { get; private set; }

    // Top interests as string array JSONB
    public string[] TopInterests { get; private set; } = [];

    // pending | ready | failed
    public string Status { get; private set; } = "pending";

    public DateTimeOffset? LastAnalysedAt { get; private set; }

    private AudienceProfile() { }

    public static AudienceProfile Create(Guid tenantId, Guid socialAccountId, string niche)
    {
        return new AudienceProfile
        {
            TenantId = tenantId,
            SocialAccountId = socialAccountId,
            Niche = niche,
            Status = "pending"
        };
    }

    public void Update(
        long followers,
        decimal avgEngagementRate,
        string[] topInterests,
        JsonDocument? ageDistribution = null,
        JsonDocument? geoDistribution = null,
        JsonDocument? activeHours = null)
    {
        TotalFollowers = followers;
        AvgEngagementRate = avgEngagementRate;
        TopInterests = topInterests;
        AgeDistribution = ageDistribution;
        GeoDistribution = geoDistribution;
        ActiveHours = activeHours;
        Status = "ready";
        LastAnalysedAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }

    public void MarkFailed()
    {
        Status = "failed";
        MarkUpdated();
    }
}
