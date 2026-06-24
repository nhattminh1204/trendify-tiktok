using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Trends.Domain;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Trends.Infrastructure;

public interface ITrendsRepository
{
    Task<TrendDetection?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken ct);
    Task<List<TrendDetection>> GetActiveAsync(Guid tenantId, string? niche, int limit, CancellationToken ct);
    Task<List<TrendDetection>> GetAllAsync(Guid tenantId, CancellationToken ct);
    Task AddAsync(TrendDetection trend, CancellationToken ct);
    Task<bool> ExistsAsync(Guid tenantId, string keyword, string platform, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);

    // Watchlist
    Task<List<TrendWatchlist>> GetWatchlistAsync(Guid tenantId, CancellationToken ct);
    Task<TrendWatchlist?> GetWatchlistItemAsync(Guid tenantId, Guid trendDetectionId, CancellationToken ct);
    Task<bool> IsTrendWatchedAsync(Guid tenantId, Guid trendDetectionId, CancellationToken ct);
    Task AddToWatchlistAsync(TrendWatchlist item, CancellationToken ct);
    void RemoveFromWatchlist(TrendWatchlist item);

    // Competitors
    Task<List<CompetitorProfile>> GetCompetitorsAsync(Guid tenantId, CancellationToken ct);
    Task<CompetitorProfile?> GetCompetitorByIdAsync(Guid id, Guid tenantId, CancellationToken ct);
    Task<bool> CompetitorExistsAsync(Guid tenantId, string tiktokUsername, CancellationToken ct);
    Task AddCompetitorAsync(CompetitorProfile competitor, CancellationToken ct);
    Task<List<CompetitorProfile>> GetAllCompetitorsAsync(CancellationToken ct);
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

    // ── Watchlist ──────────────────────────────────────────────────────────

    public Task<List<TrendWatchlist>> GetWatchlistAsync(Guid tenantId, CancellationToken ct) =>
        _db.Set<TrendWatchlist>()
            .Where(w => w.TenantId == tenantId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(ct);

    public Task<TrendWatchlist?> GetWatchlistItemAsync(
        Guid tenantId, Guid trendDetectionId, CancellationToken ct) =>
        _db.Set<TrendWatchlist>()
            .FirstOrDefaultAsync(w => w.TenantId == tenantId
                                   && w.TrendDetectionId == trendDetectionId, ct);

    public Task<bool> IsTrendWatchedAsync(
        Guid tenantId, Guid trendDetectionId, CancellationToken ct) =>
        _db.Set<TrendWatchlist>()
            .AnyAsync(w => w.TenantId == tenantId
                        && w.TrendDetectionId == trendDetectionId, ct);

    public Task AddToWatchlistAsync(TrendWatchlist item, CancellationToken ct)
    {
        _db.Set<TrendWatchlist>().Add(item);
        return Task.CompletedTask;
    }

    public void RemoveFromWatchlist(TrendWatchlist item)
    {
        _db.Set<TrendWatchlist>().Remove(item);
    }

    // ── Competitors ────────────────────────────────────────────────────────

    public Task<List<CompetitorProfile>> GetCompetitorsAsync(Guid tenantId, CancellationToken ct) =>
        _db.Set<CompetitorProfile>()
            .Where(c => c.TenantId == tenantId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

    public Task<CompetitorProfile?> GetCompetitorByIdAsync(
        Guid id, Guid tenantId, CancellationToken ct) =>
        _db.Set<CompetitorProfile>()
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId, ct);

    public Task<bool> CompetitorExistsAsync(
        Guid tenantId, string tiktokUsername, CancellationToken ct) =>
        _db.Set<CompetitorProfile>()
            .AnyAsync(c => c.TenantId == tenantId
                        && c.TikTokUsername == tiktokUsername, ct);

    public Task AddCompetitorAsync(CompetitorProfile competitor, CancellationToken ct)
    {
        _db.Set<CompetitorProfile>().Add(competitor);
        return Task.CompletedTask;
    }

    public Task<List<CompetitorProfile>> GetAllCompetitorsAsync(CancellationToken ct) =>
        _db.Set<CompetitorProfile>()
            .Where(c => c.DeletedAt == null)
            .ToListAsync(ct);

    public Task<List<TrendDetection>> GetAllAsync(Guid tenantId, CancellationToken ct) =>
        _db.Set<TrendDetection>()
            .Where(t => t.TenantId == tenantId && t.DeletedAt == null)
            .ToListAsync(ct);
}
