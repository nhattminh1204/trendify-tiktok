namespace Trendify.Infrastructure.Caching;

public static class CacheTTL
{
    public static readonly TimeSpan Hot    = TimeSpan.FromSeconds(60);
    public static readonly TimeSpan Warm   = TimeSpan.FromMinutes(10);
    public static readonly TimeSpan Cold   = TimeSpan.FromHours(1);
    public static readonly TimeSpan Frozen = TimeSpan.FromHours(24);
}
