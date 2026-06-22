namespace Trendify.Modules.Analytics.Domain;

// Append-only — never UPDATE, only INSERT
public sealed class PostMetrics
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid TenantId { get; private set; }
    public Guid PostId { get; private set; }
    public DateTimeOffset RecordedAt { get; private set; } = DateTimeOffset.UtcNow;
    public long Views { get; private set; }
    public long Likes { get; private set; }
    public long Comments { get; private set; }
    public long Shares { get; private set; }
    public long Saves { get; private set; }
    public long WatchTimeSeconds { get; private set; }
    public decimal RevenueUsd { get; private set; }

    private PostMetrics() { }

    public static PostMetrics Record(
        Guid tenantId,
        Guid postId,
        long views, long likes, long comments,
        long shares, long saves, long watchTimeSeconds,
        decimal revenueUsd)
    {
        return new PostMetrics
        {
            TenantId = tenantId,
            PostId = postId,
            Views = views,
            Likes = likes,
            Comments = comments,
            Shares = shares,
            Saves = saves,
            WatchTimeSeconds = watchTimeSeconds,
            RevenueUsd = revenueUsd
        };
    }

    public decimal EngagementRate =>
        Views > 0 ? (decimal)(Likes + Comments + Shares + Saves) / Views : 0;
}
