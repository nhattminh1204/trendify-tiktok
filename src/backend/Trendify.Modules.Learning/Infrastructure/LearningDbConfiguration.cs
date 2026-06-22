using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.Learning.Domain;

namespace Trendify.Modules.Learning.Infrastructure;

public sealed class ContentPatternConfiguration : IEntityTypeConfiguration<ContentPattern>
{
    public void Configure(EntityTypeBuilder<ContentPattern> b)
    {
        b.ToTable("content_patterns");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.Niche).HasColumnName("niche").HasMaxLength(200).IsRequired();
        b.Property(x => x.PatternType).HasColumnName("pattern_type").HasMaxLength(100).IsRequired();
        b.Property(x => x.Name).HasColumnName("name").HasMaxLength(300).IsRequired();
        b.Property(x => x.Description).HasColumnName("description").HasMaxLength(2000);
        b.Property(x => x.AvgEngagementRate).HasColumnName("avg_engagement_rate").HasPrecision(6, 4);
        b.Property(x => x.SampleSize).HasColumnName("sample_size");
        b.Property(x => x.Confidence).HasColumnName("confidence").HasPrecision(4, 3);
        b.Property(x => x.Tags).HasColumnName("tags").HasColumnType("text[]");
        b.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.Niche, x.PatternType });
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}

public sealed class ImprovementRecommendationConfiguration : IEntityTypeConfiguration<ImprovementRecommendation>
{
    public void Configure(EntityTypeBuilder<ImprovementRecommendation> b)
    {
        b.ToTable("improvement_recommendations");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.PatternId).HasColumnName("pattern_id");
        b.Property(x => x.Category).HasColumnName("category").HasMaxLength(100).IsRequired();
        b.Property(x => x.Title).HasColumnName("title").HasMaxLength(300).IsRequired();
        b.Property(x => x.Rationale).HasColumnName("rationale").HasMaxLength(2000);
        b.Property(x => x.ActionableAdvice).HasColumnName("actionable_advice").HasMaxLength(2000);
        b.Property(x => x.Priority).HasColumnName("priority").HasMaxLength(20).IsRequired();
        b.Property(x => x.Confidence).HasColumnName("confidence").HasPrecision(4, 3);
        b.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
        b.Property(x => x.AppliedAt).HasColumnName("applied_at");
        b.Property(x => x.ExpiresAt).HasColumnName("expires_at").IsRequired();
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.Status, x.Priority });
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}
