using System.Text.Json;
using Trendify.Shared.Domain;

namespace Trendify.Modules.Trends.Domain;

public sealed class TrendDetection : TenantEntity
{
    public string Keyword { get; private set; } = string.Empty;
    public string Niche { get; private set; } = string.Empty;
    public string Platform { get; private set; } = string.Empty;

    // Composite weighted score 0-100
    public decimal Score { get; private set; }
    public decimal VelocityScore { get; private set; }
    public decimal VolumeScore { get; private set; }
    public decimal EngagementScore { get; private set; }
    public decimal RecencyScore { get; private set; }

    // rising | peaked | declining | expired
    public string Status { get; private set; } = "rising";

    public DateTimeOffset? PeakAt { get; private set; }
    public DateTimeOffset? ExpiresAt { get; private set; }

    // Raw provider data as JSON
    public JsonDocument? RawData { get; private set; }

    private TrendDetection() { }

    public static TrendDetection Detect(
        Guid tenantId,
        string keyword,
        string niche,
        string platform,
        decimal velocityScore,
        decimal volumeScore,
        decimal engagementScore,
        decimal recencyScore,
        JsonDocument? rawData = null)
    {
        var score = ComputeScore(velocityScore, volumeScore, engagementScore, recencyScore);

        return new TrendDetection
        {
            TenantId = tenantId,
            Keyword = keyword.Trim(),
            Niche = niche,
            Platform = platform,
            Score = score,
            VelocityScore = velocityScore,
            VolumeScore = volumeScore,
            EngagementScore = engagementScore,
            RecencyScore = recencyScore,
            Status = score >= 80 ? "peaked" : "rising",
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            RawData = rawData
        };
    }

    public void UpdateScore(
        decimal velocityScore,
        decimal volumeScore,
        decimal engagementScore,
        decimal recencyScore)
    {
        var wasPeaked = Status == "peaked";

        VelocityScore = velocityScore;
        VolumeScore = volumeScore;
        EngagementScore = engagementScore;
        RecencyScore = recencyScore;
        Score = ComputeScore(velocityScore, volumeScore, engagementScore, recencyScore);

        Status = Score switch
        {
            >= 80 => "peaked",
            >= 40 => "rising",
            >= 10 => "declining",
            _     => "expired"
        };

        if (!wasPeaked && Status == "peaked")
            PeakAt = DateTimeOffset.UtcNow;

        ExpiresAt = DateTimeOffset.UtcNow.AddDays(7);
        MarkUpdated();
    }

    private static decimal ComputeScore(
        decimal velocity, decimal volume, decimal engagement, decimal recency) =>
        velocity * 0.40m + volume * 0.25m + engagement * 0.20m + recency * 0.15m;
}
