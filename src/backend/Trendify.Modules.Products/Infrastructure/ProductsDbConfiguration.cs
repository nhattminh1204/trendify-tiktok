using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.Products.Domain;

namespace Trendify.Modules.Products.Infrastructure;

internal sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("products");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.ExternalId).HasColumnName("external_id").HasMaxLength(200);
        b.Property(x => x.Source).HasColumnName("source").HasMaxLength(50).IsRequired().HasDefaultValue("manual");
        b.Property(x => x.Name).HasColumnName("name").HasMaxLength(500).IsRequired();
        b.Property(x => x.Category).HasColumnName("category").HasMaxLength(200);
        b.Property(x => x.Brand).HasColumnName("brand").HasMaxLength(200);
        b.Property(x => x.Price).HasColumnName("price").HasColumnType("decimal(12,2)").IsRequired();
        b.Property(x => x.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired().HasDefaultValue("VND");
        b.Property(x => x.CommissionRate).HasColumnName("commission_rate").HasColumnType("decimal(5,2)").IsRequired();
        b.Property(x => x.Score).HasColumnName("score").HasColumnType("decimal(5,2)");
        b.Property(x => x.Status).HasColumnName("status").HasMaxLength(50).HasDefaultValue("active");
        b.Property(x => x.AffiliateLink).HasColumnName("affiliate_link");
        b.Property(x => x.ThumbnailUrl).HasColumnName("thumbnail_url");
        b.Property(x => x.Description).HasColumnName("description");
        b.Property(x => x.ProductType).HasColumnName("product_type").HasMaxLength(50);
        b.Property(x => x.SyncedAt).HasColumnName("synced_at");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.Status });
        b.HasIndex(x => new { x.TenantId, x.Category });
        b.HasQueryFilter(x => x.DeletedAt == null);

        b.Ignore(x => x.CommissionAmount);
    }
}

internal sealed class ProductMetricsConfiguration : IEntityTypeConfiguration<ProductMetrics>
{
    public void Configure(EntityTypeBuilder<ProductMetrics> b)
    {
        b.ToTable("product_metrics");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        b.Property(x => x.PeriodDate).HasColumnName("period_date").IsRequired();
        b.Property(x => x.Views).HasColumnName("views").IsRequired().HasDefaultValue(0L);
        b.Property(x => x.Clicks).HasColumnName("clicks").IsRequired().HasDefaultValue(0L);
        b.Property(x => x.Orders).HasColumnName("orders").IsRequired().HasDefaultValue(0);
        b.Property(x => x.Revenue).HasColumnName("revenue").HasColumnType("decimal(12,2)").IsRequired().HasDefaultValue(0m);
        b.Property(x => x.CommissionEarned).HasColumnName("commission_earned").HasColumnType("decimal(12,2)").IsRequired().HasDefaultValue(0m);
        b.Property(x => x.Ctr).HasColumnName("ctr").HasColumnType("decimal(5,4)");
        b.Property(x => x.Cvr).HasColumnName("cvr").HasColumnType("decimal(5,4)");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");

        b.HasIndex(x => new { x.TenantId, x.ProductId, x.PeriodDate });
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}

internal sealed class ProductWatchlistConfiguration : IEntityTypeConfiguration<ProductWatchlist>
{
    public void Configure(EntityTypeBuilder<ProductWatchlist> b)
    {
        b.ToTable("product_watchlist");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        b.Property(x => x.Notes).HasColumnName("notes");
        b.Property(x => x.CreatedAt).HasColumnName("added_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.ProductId }).IsUnique();
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}
