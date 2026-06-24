using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.Trends.Domain;

namespace Trendify.Modules.Trends.Infrastructure;

public sealed class TrendDetectionConfiguration : IEntityTypeConfiguration<TrendDetection>
{
    public void Configure(EntityTypeBuilder<TrendDetection> b)
    {
        b.ToTable("trend_detections");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.Keyword).HasColumnName("keyword").HasMaxLength(500).IsRequired();
        b.Property(x => x.Niche).HasColumnName("niche").HasMaxLength(200).IsRequired();
        b.Property(x => x.Platform).HasColumnName("platform").HasMaxLength(50).IsRequired();
        b.Property(x => x.Score).HasColumnName("score").HasPrecision(5, 2).IsRequired();
        b.Property(x => x.VelocityScore).HasColumnName("velocity_score").HasPrecision(5, 2);
        b.Property(x => x.VolumeScore).HasColumnName("volume_score").HasPrecision(5, 2);
        b.Property(x => x.EngagementScore).HasColumnName("engagement_score").HasPrecision(5, 2);
        b.Property(x => x.RecencyScore).HasColumnName("recency_score").HasPrecision(5, 2);
        b.Property(x => x.Status).HasColumnName("status").HasMaxLength(30).IsRequired();
        b.Property(x => x.PeakAt).HasColumnName("peak_at");
        b.Property(x => x.ExpiresAt).HasColumnName("expires_at");
        b.Property(x => x.RawData).HasColumnName("raw_data").HasColumnType("jsonb");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.Status, x.Score });
        b.HasIndex(x => new { x.TenantId, x.Keyword, x.Platform });
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}

public sealed class TrendWatchlistConfiguration : IEntityTypeConfiguration<TrendWatchlist>
{
    public void Configure(EntityTypeBuilder<TrendWatchlist> b)
    {
        b.ToTable("trend_watchlist");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.TrendDetectionId).HasColumnName("trend_detection_id").IsRequired();
        b.Property(x => x.Notes).HasColumnName("notes").HasColumnType("text");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.TrendDetectionId }).IsUnique();
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}

public sealed class CompetitorProfileConfiguration : IEntityTypeConfiguration<CompetitorProfile>
{
    public void Configure(EntityTypeBuilder<CompetitorProfile> b)
    {
        b.ToTable("competitor_profiles");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.TikTokUsername).HasColumnName("tiktok_username").HasMaxLength(100).IsRequired();
        b.Property(x => x.DisplayName).HasColumnName("display_name").HasMaxLength(200);
        b.Property(x => x.AvatarUrl).HasColumnName("avatar_url").HasMaxLength(1000);
        b.Property(x => x.FollowerCount).HasColumnName("follower_count");
        b.Property(x => x.Notes).HasColumnName("notes").HasColumnType("text");
        b.Property(x => x.LastScannedAt).HasColumnName("last_scanned_at");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.TikTokUsername }).IsUnique();
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}
