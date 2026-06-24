using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.VideoEngine.Domain;

namespace Trendify.Modules.VideoEngine.Infrastructure;

public sealed class VideoRenderJobConfiguration : IEntityTypeConfiguration<VideoRenderJob>
{
    public void Configure(EntityTypeBuilder<VideoRenderJob> b)
    {
        b.ToTable("video_render_jobs");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.CampaignId).HasColumnName("campaign_id");
        b.Property(x => x.ContentIdeaId).HasColumnName("content_idea_id");
        b.Property(x => x.Status).HasColumnName("status").HasMaxLength(50).IsRequired();
        b.Property(x => x.RenderType).HasColumnName("render_type").HasMaxLength(50).IsRequired();
        b.Property(x => x.TemplateId).HasColumnName("template_id").HasMaxLength(100).IsRequired();
        b.Property(x => x.VoiceId).HasColumnName("voice_id").HasMaxLength(100).IsRequired();
        b.Property(x => x.TtsEngine).HasColumnName("tts_engine").HasMaxLength(50).IsRequired();
        b.Property(x => x.VoiceSpeed).HasColumnName("voice_speed").HasPrecision(3, 2);
        b.Property(x => x.ScriptText).HasColumnName("script_text");
        b.Property(x => x.CaptionText).HasColumnName("caption_text");
        b.Property(x => x.Hashtags).HasColumnName("hashtags");
        b.Property(x => x.OutputUrl).HasColumnName("output_url");
        b.Property(x => x.ThumbnailUrl).HasColumnName("thumbnail_url");
        b.Property(x => x.DurationSeconds).HasColumnName("duration_seconds");
        b.Property(x => x.FileSizeBytes).HasColumnName("file_size_bytes");
        b.Property(x => x.ErrorMessage).HasColumnName("error_message");
        b.Property(x => x.RetryCount).HasColumnName("retry_count");
        b.Property(x => x.ViralTemplateId).HasColumnName("viral_template_id");
        b.Property(x => x.AiModelId).HasColumnName("ai_model_id");
        b.Property(x => x.QueuedAt).HasColumnName("queued_at");
        b.Property(x => x.StartedAt).HasColumnName("started_at");
        b.Property(x => x.CompletedAt).HasColumnName("completed_at");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.TenantId, x.Status });
        b.HasIndex(x => new { x.TenantId, x.CampaignId });
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}

public sealed class VideoAssetConfiguration : IEntityTypeConfiguration<VideoAsset>
{
    public void Configure(EntityTypeBuilder<VideoAsset> b)
    {
        b.ToTable("video_assets");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.RenderJobId).HasColumnName("render_job_id").IsRequired();
        b.Property(x => x.AssetType).HasColumnName("asset_type").HasMaxLength(50).IsRequired();
        b.Property(x => x.SourceUrl).HasColumnName("source_url").IsRequired();
        b.Property(x => x.MinioUrl).HasColumnName("minio_url");
        b.Property(x => x.SortOrder).HasColumnName("sort_order");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => new { x.RenderJobId, x.SortOrder });
        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}

public sealed class VideoTemplateConfiguration : IEntityTypeConfiguration<VideoTemplate>
{
    public void Configure(EntityTypeBuilder<VideoTemplate> b)
    {
        b.ToTable("video_templates");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id").HasMaxLength(100);
        b.Property(x => x.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        b.Property(x => x.Description).HasColumnName("description");
        b.Property(x => x.AspectRatio).HasColumnName("aspect_ratio").HasMaxLength(20);
        b.Property(x => x.MaxDurationSeconds).HasColumnName("max_duration_seconds");
        b.Property(x => x.MinDurationSeconds).HasColumnName("min_duration_seconds");
        b.Property(x => x.ContentStyles).HasColumnName("content_styles");
        b.Property(x => x.PreviewUrl).HasColumnName("preview_url");
        b.Property(x => x.IsActive).HasColumnName("is_active");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
    }
}
