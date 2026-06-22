using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Trends.Domain;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Trends.Infrastructure;

public interface ITrendsRepository
{
    Task<TrendDetection?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken ct);
    Task<List<TrendDetection>> GetActiveAsync(Guid tenantId, string? niche, int limit, CancellationToken ct);
    Task AddAsync(TrendDetection trend, CancellationToken ct);
    Task<bool> ExistsAsync(Guid tenantId, string keyword, string platform, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

public sealed class TrendsRepository : ITrendsRepository
{
    private readonly AppDbContext _db;

    public TrendsRepository(AppDbContext db) => _db = db;

    public Task<TrendDetection?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken ct) =>
        _db.Set<TrendDetection>()
            .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId, ct);

    public Task<List<TrendDetection>> GetActiveAsync(
        Guid tenantId, string? niche, int limit, CancellationToken ct)
    {
        var query = _db.Set<TrendDetection>()
            .Where(t => t.TenantId == tenantId &&
                        (t.Status == "rising" || t.Status == "peaked"))
            .AsQueryable();

        if (!string.IsNullOrEmpty(niche))
            query = query.Where(t => t.Niche == niche);

        return query
            .OrderByDescending(t => t.Score)
            .Take(Math.Clamp(limit, 1, 100))
            .ToListAsync(ct);
    }

    public Task AddAsync(TrendDetection trend, CancellationToken ct)
    {
        _db.Set<TrendDetection>().Add(trend);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(Guid tenantId, string keyword, string platform, CancellationToken ct) =>
        _db.Set<TrendDetection>()
            .AnyAsync(t => t.TenantId == tenantId
                        && t.Keyword == keyword
                        && t.Platform == platform
                        && t.Status != "expired", ct);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
