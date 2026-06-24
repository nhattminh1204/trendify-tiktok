using Trendify.Modules.Products.Domain;

namespace Trendify.Modules.Products.Infrastructure;

public interface IProductsRepository
{
    Task<Product?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken ct);
    Task<List<Product>> GetListAsync(Guid tenantId, string? sort, string? category, decimal? minScore, string? status, int page, int pageSize, CancellationToken ct);
    Task<int> GetCountAsync(Guid tenantId, string? category, decimal? minScore, string? status, CancellationToken ct);
    Task<bool> ExistsByAffiliateLinkAsync(Guid tenantId, string link, CancellationToken ct);
    Task AddAsync(Product product, CancellationToken ct);
    Task<ProductWatchlist?> GetWatchlistItemAsync(Guid tenantId, Guid productId, CancellationToken ct);
    Task<List<ProductWatchlist>> GetWatchlistAsync(Guid tenantId, CancellationToken ct);
    Task<bool> IsInWatchlistAsync(Guid tenantId, Guid productId, CancellationToken ct);
    Task AddToWatchlistAsync(ProductWatchlist item, CancellationToken ct);
    Task RemoveFromWatchlistAsync(ProductWatchlist item, CancellationToken ct);
    Task<ProductMetrics?> GetLatestMetricsAsync(Guid tenantId, Guid productId, CancellationToken ct);
    Task<List<ProductMetrics>> GetMetricsAsync(Guid tenantId, Guid productId, int days, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
