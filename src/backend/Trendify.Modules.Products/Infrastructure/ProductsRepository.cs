using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Products.Domain;

namespace Trendify.Modules.Products.Infrastructure;

internal sealed class ProductsRepository : IProductsRepository
{
    private readonly AppDbContext _db;

    public ProductsRepository(AppDbContext db) => _db = db;

    public Task<Product?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken ct) =>
        _db.Set<Product>().FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, ct);

    public Task<List<Product>> GetListAsync(
        Guid tenantId, string? sort, string? category, decimal? minScore,
        string? status, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.Set<Product>().Where(x => x.TenantId == tenantId);

        if (!string.IsNullOrEmpty(category))
            q = q.Where(x => x.Category == category);
        if (minScore.HasValue)
            q = q.Where(x => x.Score >= minScore.Value);
        if (!string.IsNullOrEmpty(status))
            q = q.Where(x => x.Status == status);
        else
            q = q.Where(x => x.Status == "active");

        q = sort switch
        {
            "commission" => q.OrderByDescending(x => x.CommissionRate),
            "velocity" => q.OrderByDescending(x => x.SyncedAt),
            _ => q.OrderByDescending(x => x.Score),
        };

        return q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public Task<int> GetCountAsync(
        Guid tenantId, string? category, decimal? minScore, string? status, CancellationToken ct)
    {
        var q = _db.Set<Product>().Where(x => x.TenantId == tenantId);

        if (!string.IsNullOrEmpty(category))
            q = q.Where(x => x.Category == category);
        if (minScore.HasValue)
            q = q.Where(x => x.Score >= minScore.Value);
        if (!string.IsNullOrEmpty(status))
            q = q.Where(x => x.Status == status);
        else
            q = q.Where(x => x.Status == "active");

        return q.CountAsync(ct);
    }

    public Task<bool> ExistsByAffiliateLinkAsync(Guid tenantId, string link, CancellationToken ct) =>
        _db.Set<Product>().AnyAsync(x => x.TenantId == tenantId && x.AffiliateLink == link, ct);

    public Task AddAsync(Product product, CancellationToken ct)
    {
        _db.Set<Product>().Add(product);
        return Task.CompletedTask;
    }

    public Task<ProductWatchlist?> GetWatchlistItemAsync(Guid tenantId, Guid productId, CancellationToken ct) =>
        _db.Set<ProductWatchlist>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.ProductId == productId, ct);

    public Task<List<ProductWatchlist>> GetWatchlistAsync(Guid tenantId, CancellationToken ct) =>
        _db.Set<ProductWatchlist>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public Task<bool> IsInWatchlistAsync(Guid tenantId, Guid productId, CancellationToken ct) =>
        _db.Set<ProductWatchlist>()
            .AnyAsync(x => x.TenantId == tenantId && x.ProductId == productId, ct);

    public Task AddToWatchlistAsync(ProductWatchlist item, CancellationToken ct)
    {
        _db.Set<ProductWatchlist>().Add(item);
        return Task.CompletedTask;
    }

    public Task RemoveFromWatchlistAsync(ProductWatchlist item, CancellationToken ct)
    {
        _db.Set<ProductWatchlist>().Remove(item);
        return Task.CompletedTask;
    }

    public Task<ProductMetrics?> GetLatestMetricsAsync(Guid tenantId, Guid productId, CancellationToken ct) =>
        _db.Set<ProductMetrics>()
            .Where(x => x.TenantId == tenantId && x.ProductId == productId)
            .OrderByDescending(x => x.PeriodDate)
            .FirstOrDefaultAsync(ct);

    public Task<List<ProductMetrics>> GetMetricsAsync(
        Guid tenantId, Guid productId, int days, CancellationToken ct)
    {
        var since = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
        return _db.Set<ProductMetrics>()
            .Where(x => x.TenantId == tenantId && x.ProductId == productId && x.PeriodDate >= since)
            .OrderByDescending(x => x.PeriodDate)
            .ToListAsync(ct);
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
