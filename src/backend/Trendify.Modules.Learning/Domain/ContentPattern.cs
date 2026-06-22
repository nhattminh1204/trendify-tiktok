using Trendify.Shared.Domain;

namespace Trendify.Modules.Learning.Domain;

public sealed class ContentPattern : TenantEntity
{
    public string Niche { get; private set; } = string.Empty;
    public string PatternType { get; private set; } = string.Empty;

    // Human-readable name: "15s hook with question"
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;

    // avg engagement rate of posts matching this pattern
    public decimal AvgEngagementRate { get; private set; }

    // number of posts this was derived from
    public int SampleSize { get; private set; }

    // 0-1 confidence score
    public decimal Confidence { get; private set; }

    // JSON array: hook_style, cta_type, duration_range, etc.
    public string[] Tags { get; private set; } = [];

    // active | archived
    public string Status { get; private set; } = "active";

    private ContentPattern() { }

    public static ContentPattern Discover(
        Guid tenantId,
        string niche,
        string patternType,
        string name,
        string description,
        decimal avgEngagementRate,
        int sampleSize,
        decimal confidence,
        string[] tags)
    {
        return new ContentPattern
        {
            TenantId = tenantId,
            Niche = niche,
            PatternType = patternType,
            Name = name,
            Description = description,
            AvgEngagementRate = avgEngagementRate,
            SampleSize = sampleSize,
            Confidence = confidence,
            Tags = tags,
            Status = "active"
        };
    }

    public void Reinforce(decimal newEngagementRate, int additionalSamples)
    {
        var totalSamples = SampleSize + additionalSamples;
        AvgEngagementRate = (AvgEngagementRate * SampleSize + newEngagementRate * additionalSamples) / totalSamples;
        SampleSize = totalSamples;
        Confidence = Math.Min(1.0m, Confidence + additionalSamples * 0.01m);
        MarkUpdated();
    }

    public void Archive()
    {
        Status = "archived";
        MarkUpdated();
    }
}
