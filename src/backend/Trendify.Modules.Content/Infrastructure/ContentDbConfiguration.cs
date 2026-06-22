using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.Content.Domain;

namespace Trendify.Modules.Content.Infrastructure;

public sealed class ContentIdeaConfiguration : IEntityTypeConfiguration<ContentIdea>
{
    public void Configure(EntityTypeBuilder<ContentIdea> b)
    {
        b.ToTable("content_ideas");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.Title).HasColumnName("title").HasMaxLength(500).IsRequired();
        b.Property(x => x.Description).HasColumnName("description").HasMaxLength(5000);
        b.Property(x => x.Hook).HasColumnName("hook").HasMaxLength(1000);
        b.Property(x => x.Script).HasColumnName("script");
        b.Property(x => x.Cta).HasColumnName("cta").HasMaxLength(500);
        b.Property(x => x.Niche).HasColumnName("niche").HasMaxLength(200);
        b.Property(x => x.TargetPersonaId).HasColumnName("target_persona_id");
        b.Property(x => x.TrendId).HasColumnName("trend_id");
        b.Property(x => x.Status).HasColumnName("status").HasMaxLength(30).IsRequired();
        b.Property(x => x.GeneratedByAI).HasColumnName("generated_by_ai").IsRequired();
        b.Property(x => x.CreatedByUserId).HasColumnName("created_by_user_id").IsRequired();
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.Status });
        b.HasIndex(x => new { x.TenantId, x.TrendId });
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}
