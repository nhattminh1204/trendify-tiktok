using Trendify.Shared.Domain;

namespace Trendify.Modules.Products.Domain;

public sealed class ProductMetrics : TenantEntity
{
    public Guid ProductId { get; private set; }
    public DateOnly PeriodDate { get; private set; }
    public long Views { get; private set; }
    public long Clicks { get; private set; }
    public int Orders { get; private set; }
    public decimal Revenue { get; private set; }
    public decimal CommissionEarned { get; private set; }
    public decimal Ctr { get; private set; }
    public decimal Cvr { get; private set; }

    private ProductMetrics() { }

    public static ProductMetrics Record(
        Guid tenantId,
        Guid productId,
        DateOnly periodDate,
        long views = 0,
        long clicks = 0,
        int orders = 0,
        decimal revenue = 0,
        decimal commissionEarned = 0)
    {
        return new ProductMetrics
        {
            TenantId = tenantId,
            ProductId = productId,
            PeriodDate = periodDate,
            Views = views,
            Clicks = clicks,
            Orders = orders,
            Revenue = revenue,
            CommissionEarned = commissionEarned,
            Ctr = views > 0 ? Math.Round((decimal)clicks / views, 4) : 0,
            Cvr = clicks > 0 ? Math.Round((decimal)orders / clicks, 4) : 0
        };
    }
}
