using Trendify.Shared.Events;

namespace Trendify.Modules.VideoEngine.Application.Events;

public sealed record VideoRenderJobCreatedEvent(
    Guid TenantId,
    Guid RenderJobId,
    Guid? CampaignId,
    Guid? ContentIdeaId,
    string TemplateId
) : DomainEventBase(TenantId);

public sealed record VideoRenderedEvent(
    Guid TenantId,
    Guid RenderJobId,
    Guid? CampaignId,
    Guid? ContentIdeaId,
    string OutputUrl,
    string? ThumbnailUrl,
    short DurationSeconds,
    string? CaptionText,
    string[]? Hashtags,
    Guid[]? TargetAccountIds
) : DomainEventBase(TenantId);

public sealed record VideoRenderFailedEvent(
    Guid TenantId,
    Guid RenderJobId,
    Guid? CampaignId,
    string ErrorMessage
) : DomainEventBase(TenantId);

public sealed record VideoRenderJobCancelledEvent(
    Guid TenantId,
    Guid RenderJobId,
    Guid? CampaignId
) : DomainEventBase(TenantId);
