using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.Analytics.Domain;

namespace Trendify.Modules.Analytics.Infrastructure;

public sealed class PostMetricsConfiguration : IEntityTypeConfiguration<PostMetrics>
{
    public void Configure(EntityTypeBuilder<PostMetrics> b)
    {
        b.ToTable("post_metrics");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.PostId).HasColumnName("post_id").IsRequired();
        b.Property(x => x.RecordedAt).HasColumnName("recorded_at").IsRequired();
        b.Property(x => x.Views).HasColumnName("views");
        b.Property(x => x.Likes).HasColumnName("likes");
        b.Property(x => x.Comments).HasColumnName("comments");
        b.Property(x => x.Shares).HasColumnName("shares");
        b.Property(x => x.Saves).HasColumnName("saves");
        b.Property(x => x.WatchTimeSeconds).HasColumnName("watch_time_seconds");
        b.Property(x => x.RevenueUsd).HasColumnName("revenue_usd").HasPrecision(12, 4);

        // Append-only — no update tracking columns needed
        b.HasIndex(x => new { x.TenantId, x.PostId, x.RecordedAt });
        b.HasIndex(x => new { x.TenantId, x.RecordedAt });
    }
}
