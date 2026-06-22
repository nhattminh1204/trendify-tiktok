namespace Trendify.Infrastructure.Caching;

public static class CacheKeys
{
    // Trends
    public static string TrendFeed(Guid tenantId, string variant = "top50") =>
        $"trends:feed:{tenantId}:{variant}";

    public static string TrendDetail(Guid tenantId, Guid trendId) =>
        $"trends:detail:{tenantId}:{trendId}";

    // Analytics
    public static string AnalyticsOverview(Guid tenantId, Guid? accountId, string period) =>
        $"analytics:overview:{tenantId}:{accountId?.ToString() ?? "all"}:{period}";

    // Audience
    public static string AudienceProfile(Guid tenantId, Guid socialAccountId) =>
        $"audience:profile:{tenantId}:{socialAccountId}";

    // AI
    public static string AIRecommendations(Guid tenantId) =>
        $"ai:recommendations:{tenantId}:top3";

    public static string PromptTemplate(string slug) =>
        $"prompts:{slug}:active";

    public static string AIBudget(Guid tenantId) =>
        $"ai:budget:{tenantId}:current-month";

    // Accounts
    public static string SocialAccounts(Guid tenantId) =>
        $"accounts:social:{tenantId}:all";

    public static string WorkspaceInfo(Guid tenantId) =>
        $"accounts:workspace:{tenantId}";

    // Learning
    public static string WinningPatterns(Guid tenantId) =>
        $"learning:patterns:{tenantId}:winning";
}
