using Trendify.Shared.Domain;

namespace Trendify.Modules.Products.Domain;

public sealed class ProductWatchlist : TenantEntity
{
    public Guid ProductId { get; private set; }
    public string? Notes { get; private set; }

    private ProductWatchlist() { }

    public static ProductWatchlist Add(Guid tenantId, Guid productId, string? notes = null)
    {
        return new ProductWatchlist
        {
            TenantId = tenantId,
            ProductId = productId,
            Notes = notes?.Trim()
        };
    }

    public void UpdateNotes(string? notes)
    {
        Notes = notes?.Trim();
        MarkUpdated();
    }
}
