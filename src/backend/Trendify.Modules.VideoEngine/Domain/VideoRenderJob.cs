using Trendify.Shared.Domain;

namespace Trendify.Modules.VideoEngine.Domain;

public sealed class VideoRenderJob : TenantEntity
{
    public Guid? CampaignId { get; private set; }
    public Guid? ContentIdeaId { get; private set; }

    public string Status { get; private set; } = "queued";
    public string RenderType { get; private set; } = "text_to_video";
    public string TemplateId { get; private set; } = "product-review-v1";
    public string VoiceId { get; private set; } = "vi-VN-HoaiMyNeural";
    public string TtsEngine { get; private set; } = "edge";
    public decimal VoiceSpeed { get; private set; } = 1.00m;

    public string? ScriptText { get; private set; }
    public string? CaptionText { get; private set; }
    public string[]? Hashtags { get; private set; }

    public string? OutputUrl { get; private set; }
    public string? ThumbnailUrl { get; private set; }
    public short? DurationSeconds { get; private set; }
    public long? FileSizeBytes { get; private set; }
    public string? ErrorMessage { get; private set; }
    public short RetryCount { get; private set; }

    public Guid? ViralTemplateId { get; private set; }
    public Guid? AiModelId { get; private set; }

    public DateTimeOffset? QueuedAt { get; private set; }
    public DateTimeOffset? StartedAt { get; private set; }
    public DateTimeOffset? CompletedAt { get; private set; }

    private VideoRenderJob() { }

    public static VideoRenderJob Create(
        Guid tenantId,
        Guid? campaignId,
        Guid? contentIdeaId,
        string templateId,
        string voiceId,
        string ttsEngine,
        decimal voiceSpeed,
        string scriptText,
        string? captionText,
        string[]? hashtags,
        string renderType = "text_to_video",
        Guid? viralTemplateId = null,
        Guid? aiModelId = null,
        Guid? campaignIdForStatus = null)
    {
        return new VideoRenderJob
        {
            TenantId = tenantId,
            CampaignId = campaignId,
            ContentIdeaId = contentIdeaId,
            TemplateId = templateId,
            VoiceId = voiceId,
            TtsEngine = ttsEngine,
            VoiceSpeed = voiceSpeed,
            ScriptText = scriptText,
            CaptionText = captionText,
            Hashtags = hashtags,
            RenderType = renderType,
            ViralTemplateId = viralTemplateId,
            AiModelId = aiModelId,
            Status = "queued",
            QueuedAt = DateTimeOffset.UtcNow,
        };
    }

    public void StartProcessing()
    {
        Status = "processing";
        StartedAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }

    public void Complete(string outputUrl, string? thumbnailUrl, short durationSeconds, long fileSizeBytes)
    {
        Status = "rendered";
        OutputUrl = outputUrl;
        ThumbnailUrl = thumbnailUrl;
        DurationSeconds = durationSeconds;
        FileSizeBytes = fileSizeBytes;
        CompletedAt = DateTimeOffset.UtcNow;
        ErrorMessage = null;
        MarkUpdated();
    }

    public void Fail(string errorMessage)
    {
        Status = "failed";
        ErrorMessage = errorMessage;
        CompletedAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }

    public void IncrementRetry()
    {
        RetryCount++;
        if (RetryCount >= 3)
        {
            Status = "failed";
            CompletedAt = DateTimeOffset.UtcNow;
            ErrorMessage ??= "Max retries exceeded";
        }
        else
        {
            Status = "queued";
            StartedAt = null;
        }
        MarkUpdated();
    }

    public void Cancel()
    {
        if (Status == "queued" || Status == "processing")
        {
            Status = "cancelled";
            CompletedAt = DateTimeOffset.UtcNow;
            ErrorMessage = "Cancelled by user or campaign lifecycle";
            MarkUpdated();
        }
    }

    public void AssignAssets(string[] assetUrls)
    {
        MarkUpdated();
    }
}
