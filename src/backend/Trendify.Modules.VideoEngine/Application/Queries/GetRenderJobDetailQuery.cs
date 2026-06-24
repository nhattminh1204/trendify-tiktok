using MediatR;

namespace Trendify.Modules.VideoEngine.Application.Queries;

public sealed record GetRenderJobDetailQuery(Guid Id) : IRequest<RenderJobDetailDto?>;

public sealed class RenderJobDetailDto
{
    public Guid Id { get; init; }
    public Guid? CampaignId { get; init; }
    public Guid? ContentIdeaId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string RenderType { get; init; } = string.Empty;
    public string TemplateId { get; init; } = string.Empty;
    public string VoiceId { get; init; } = string.Empty;
    public string TtsEngine { get; init; } = string.Empty;
    public decimal VoiceSpeed { get; init; }
    public string? ScriptText { get; init; }
    public string? CaptionText { get; init; }
    public string[]? Hashtags { get; init; }
    public string? OutputUrl { get; init; }
    public string? ThumbnailUrl { get; init; }
    public short? DurationSeconds { get; init; }
    public long? FileSizeBytes { get; init; }
    public string? ErrorMessage { get; init; }
    public short RetryCount { get; init; }
    public Guid? ViralTemplateId { get; init; }
    public Guid? AiModelId { get; init; }
    public DateTimeOffset? QueuedAt { get; init; }
    public DateTimeOffset? StartedAt { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}
