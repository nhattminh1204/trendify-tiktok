using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Analytics.Domain;

namespace Trendify.Modules.Analytics.Infrastructure;

public interface IAnalyticsRepository
{
    Task<List<PostMetrics>> GetByPostAsync(Guid tenantId, Guid postId, int limit, CancellationToken ct);
    Task<PostMetrics?> GetLatestAsync(Guid tenantId, Guid postId, CancellationToken ct);
    Task AddAsync(PostMetrics metrics, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

public sealed class AnalyticsRepository : IAnalyticsRepository
{
    private readonly AppDbContext _db;

    public AnalyticsRepository(AppDbContext db) => _db = db;

    public Task<List<PostMetrics>> GetByPostAsync(
        Guid tenantId, Guid postId, int limit, CancellationToken ct) =>
        _db.Set<PostMetrics>()
            .Where(m => m.TenantId == tenantId && m.PostId == postId)
            .OrderByDescending(m => m.RecordedAt)
            .Take(Math.Clamp(limit, 1, 500))
            .ToListAsync(ct);

    public Task<PostMetrics?> GetLatestAsync(Guid tenantId, Guid postId, CancellationToken ct) =>
        _db.Set<PostMetrics>()
            .Where(m => m.TenantId == tenantId && m.PostId == postId)
            .OrderByDescending(m => m.RecordedAt)
            .FirstOrDefaultAsync(ct);

    public Task AddAsync(PostMetrics metrics, CancellationToken ct)
    {
        _db.Set<PostMetrics>().Add(metrics);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
