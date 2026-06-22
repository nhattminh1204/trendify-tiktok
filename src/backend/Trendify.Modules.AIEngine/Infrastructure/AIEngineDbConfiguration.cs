using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.AIEngine.Domain;

namespace Trendify.Modules.AIEngine.Infrastructure;

public sealed class AIPromptConfiguration : IEntityTypeConfiguration<AIPrompt>
{
    public void Configure(EntityTypeBuilder<AIPrompt> b)
    {
        b.ToTable("ai_prompts");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(200).IsRequired();
        b.Property(x => x.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        b.Property(x => x.Description).HasColumnName("description").HasMaxLength(2000);
        b.Property(x => x.Template).HasColumnName("template").IsRequired();
        b.Property(x => x.Tier).HasColumnName("tier").HasMaxLength(20).IsRequired();
        b.Property(x => x.FeatureContext).HasColumnName("feature_context").HasMaxLength(200).IsRequired();
        b.Property(x => x.Version).HasColumnName("version").IsRequired();
        b.Property(x => x.IsActive).HasColumnName("is_active").IsRequired();
        b.Property(x => x.Variables).HasColumnName("variables")
            .HasColumnType("jsonb")
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v, (System.Text.Json.JsonSerializerOptions?)null)!
            );
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.Slug, x.Version }).IsUnique()
            .HasFilter("deleted_at IS NULL");
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}

public sealed class AIUsageLogConfiguration : IEntityTypeConfiguration<AIUsageLog>
{
    public void Configure(EntityTypeBuilder<AIUsageLog> b)
    {
        b.ToTable("ai_usage_logs");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
        b.Property(x => x.CorrelationId).HasColumnName("correlation_id").IsRequired();
        b.Property(x => x.FeatureContext).HasColumnName("feature_context").HasMaxLength(200).IsRequired();
        b.Property(x => x.PromptId).HasColumnName("prompt_id");
        b.Property(x => x.Provider).HasColumnName("provider").HasMaxLength(50).IsRequired();
        b.Property(x => x.Model).HasColumnName("model").HasMaxLength(100).IsRequired();
        b.Property(x => x.PromptTokens).HasColumnName("prompt_tokens").IsRequired();
        b.Property(x => x.CompletionTokens).HasColumnName("completion_tokens").IsRequired();
        b.Property(x => x.EstimatedCostUsd).HasColumnName("estimated_cost_usd")
            .HasPrecision(10, 6).IsRequired();
        b.Property(x => x.DurationMs).HasColumnName("duration_ms").IsRequired();
        b.Property(x => x.Status).HasColumnName("status").HasMaxLength(30).IsRequired();
        b.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        // Append-only — no updates
        b.HasIndex(x => new { x.TenantId, x.CreatedAt });
        b.HasIndex(x => x.CorrelationId);
    }
}
