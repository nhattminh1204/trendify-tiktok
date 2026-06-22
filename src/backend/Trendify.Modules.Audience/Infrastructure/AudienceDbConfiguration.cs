using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.Audience.Domain;

namespace Trendify.Modules.Audience.Infrastructure;

public sealed class AudienceProfileConfiguration : IEntityTypeConfiguration<AudienceProfile>
{
    public void Configure(EntityTypeBuilder<AudienceProfile> b)
    {
        b.ToTable("audience_profiles");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.SocialAccountId).HasColumnName("social_account_id").IsRequired();
        b.Property(x => x.Niche).HasColumnName("niche").HasMaxLength(200).IsRequired();
        b.Property(x => x.TotalFollowers).HasColumnName("total_followers");
        b.Property(x => x.AvgEngagementRate).HasColumnName("avg_engagement_rate").HasPrecision(6, 4);
        b.Property(x => x.AgeDistribution).HasColumnName("age_distribution").HasColumnType("jsonb");
        b.Property(x => x.GeoDistribution).HasColumnName("geo_distribution").HasColumnType("jsonb");
        b.Property(x => x.ActiveHours).HasColumnName("active_hours").HasColumnType("jsonb");
        b.Property(x => x.TopInterests).HasColumnName("top_interests").HasColumnType("text[]");
        b.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
        b.Property(x => x.LastAnalysedAt).HasColumnName("last_analysed_at");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.SocialAccountId }).IsUnique()
            .HasFilter("deleted_at IS NULL");
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}

public sealed class AudiencePersonaConfiguration : IEntityTypeConfiguration<AudiencePersona>
{
    public void Configure(EntityTypeBuilder<AudiencePersona> b)
    {
        b.ToTable("audience_personas");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.ProfileId).HasColumnName("profile_id").IsRequired();
        b.Property(x => x.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        b.Property(x => x.Description).HasColumnName("description").HasMaxLength(2000);
        b.Property(x => x.AgeMin).HasColumnName("age_min");
        b.Property(x => x.AgeMax).HasColumnName("age_max");
        b.Property(x => x.Gender).HasColumnName("gender").HasMaxLength(20);
        b.Property(x => x.Interests).HasColumnName("interests").HasColumnType("text[]");
        b.Property(x => x.PainPoints).HasColumnName("pain_points").HasColumnType("text[]");
        b.Property(x => x.ContentPreferences).HasColumnName("content_preferences").HasColumnType("text[]");
        b.Property(x => x.Percentage).HasColumnName("percentage").HasPrecision(5, 2);
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.ProfileId });
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}
