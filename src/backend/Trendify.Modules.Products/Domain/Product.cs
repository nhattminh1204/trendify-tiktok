using Trendify.Shared.Domain;

namespace Trendify.Modules.Products.Domain;

public sealed class Product : TenantEntity
{
    public string? ExternalId { get; private set; }
    public string Source { get; private set; } = "manual";
    public string Name { get; private set; } = string.Empty;
    public string? Category { get; private set; }
    public string? Brand { get; private set; }
    public decimal Price { get; private set; }
    public string Currency { get; private set; } = "VND";
    public decimal CommissionRate { get; private set; }
    public decimal CommissionAmount => Price * CommissionRate / 100m;
    public decimal Score { get; private set; }
    public string Status { get; private set; } = "active";
    public string? AffiliateLink { get; private set; }
    public string? ThumbnailUrl { get; private set; }
    public string? Description { get; private set; }
    public string? ProductType { get; private set; }
    public DateTimeOffset? SyncedAt { get; private set; }

    private Product() { }

    public static Product Import(
        Guid tenantId,
        string name,
        decimal price,
        decimal commissionRate,
        string? affiliateLink,
        string? category = null,
        string? brand = null,
        string? description = null,
        string? externalId = null,
        string? thumbnailUrl = null,
        string? productType = null,
        string currency = "VND")
    {
        return new Product
        {
            TenantId = tenantId,
            ExternalId = externalId,
            Source = "manual",
            Name = name.Trim(),
            Category = category?.Trim(),
            Brand = brand?.Trim(),
            Price = price,
            Currency = currency,
            CommissionRate = commissionRate,
            Score = CalculateScore(commissionRate, 0, 0, 0),
            AffiliateLink = affiliateLink?.Trim(),
            ThumbnailUrl = thumbnailUrl?.Trim(),
            Description = description?.Trim(),
            ProductType = productType?.Trim()
        };
    }

    public void Update(
        string? name = null,
        decimal? price = null,
        decimal? commissionRate = null,
        string? category = null,
        string? brand = null,
        string? description = null,
        string? productType = null)
    {
        if (name != null) Name = name.Trim();
        if (price.HasValue) Price = price.Value;
        if (commissionRate.HasValue) CommissionRate = commissionRate.Value;
        if (category != null) Category = category.Trim();
        if (brand != null) Brand = brand.Trim();
        if (description != null) Description = description.Trim();
        if (productType != null) ProductType = productType.Trim();

        RecalculateScore();
        MarkUpdated();
    }

    public void Archive()
    {
        Status = "archived";
        MarkUpdated();
    }

    public void MarkDelisted()
    {
        Status = "delisted";
        MarkUpdated();
    }

    public void MarkOutOfStock()
    {
        Status = "out_of_stock";
        MarkUpdated();
    }

    public void SetThumbnail(string url)
    {
        ThumbnailUrl = url;
        MarkUpdated();
    }

    public void RecalculateScore()
    {
        Score = CalculateScore(CommissionRate, 0, 0, 0);
    }

    public static decimal CalculateScore(
        decimal commissionRate,
        decimal velocityScore,
        decimal demandScore,
        decimal competitionScore)
    {
        var commissionScore = commissionRate >= 20m ? 100m :
                              commissionRate >= 15m ? 80m :
                              commissionRate >= 10m ? 60m :
                              commissionRate >= 5m ? 40m : 20m;

        var score = commissionScore * 0.35m
                    + velocityScore * 0.30m
                    + demandScore * 0.20m
                    + competitionScore * 0.15m;

        return Math.Clamp(Math.Round(score, 2), 0, 100);
    }
}
