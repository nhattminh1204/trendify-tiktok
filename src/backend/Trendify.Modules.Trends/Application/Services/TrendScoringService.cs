namespace Trendify.Modules.Trends.Application.Services;

public sealed class TrendScoringService
{
    // Score = (velocity * 0.40) + (volume * 0.25) + (engagement * 0.20) + (recency * 0.15)

    public decimal Calculate(TrendSignal signal)
    {
        var velocityScore = NormalizeVelocity(signal.PostsPerHour) * 40;
        var volumeScore = NormalizeVolume(signal.TotalPosts) * 25;
        var engagementScore = NormalizeEngagement(signal.EngagementRate) * 20;
        var recencyScore = NormalizeRecency(signal.AgeInHours) * 15;

        return Math.Round(velocityScore + volumeScore + engagementScore + recencyScore, 2);
    }

    private static decimal NormalizeVelocity(decimal postsPerHour) =>
        Math.Min(postsPerHour / 1000m, 1.0m);

    private static decimal NormalizeVolume(long totalPosts)
    {
        if (totalPosts <= 0) return 0;
        return (decimal)Math.Min(Math.Log10((double)totalPosts) / 7.0, 1.0);
    }

    private static decimal NormalizeEngagement(decimal engagementRate) =>
        Math.Min(engagementRate / 0.10m, 1.0m);

    private static decimal NormalizeRecency(int ageInHours)
    {
        // Fresh content (< 24h) = 1.0, week old = 0.0
        if (ageInHours <= 24) return 1.0m;
        if (ageInHours >= 168) return 0.0m;
        return 1.0m - (ageInHours - 24) / 144m;
    }

    // Phase 1 stub — Phase 2 replaces with real TikTok Trending API call
    public List<ScoredKeyword> SimulateKeywords(string niche)
    {
        var nicheSeeds = new Dictionary<string, string[]>
        {
            ["fitness"]   = ["workout routine", "gym motivation", "home workout", "protein meal prep"],
            ["cooking"]   = ["quick dinner", "meal prep", "5 ingredient recipe", "healthy snack"],
            ["tech"]      = ["ai tools 2025", "productivity apps", "coding tips", "tech review"],
            ["beauty"]    = ["skincare routine", "makeup tutorial", "glow up tips", "affordable dupes"],
            ["finance"]   = ["passive income", "side hustle", "saving money tips", "investing beginner"],
        };

        var keywords = nicheSeeds.GetValueOrDefault(niche.ToLower(),
            ["trending content", "viral tips", "creator tips"]);

        return keywords.Select((kw, i) => new ScoredKeyword(
            Keyword: kw,
            VelocityScore: Math.Min(1.0m, 0.5m + i * 0.1m),
            VolumeScore: Math.Min(1.0m, 0.6m + i * 0.05m),
            EngagementScore: Math.Min(1.0m, 0.4m + i * 0.15m),
            RecencyScore: 0.9m
        )).ToList();
    }
}

public sealed record TrendSignal(
    string Keyword,
    decimal PostsPerHour,
    long TotalPosts,
    decimal EngagementRate,
    int AgeInHours
);

public sealed record ScoredKeyword(
    string Keyword,
    decimal VelocityScore,
    decimal VolumeScore,
    decimal EngagementScore,
    decimal RecencyScore
);
