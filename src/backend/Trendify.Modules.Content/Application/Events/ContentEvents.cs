using Trendify.Shared.Events;

namespace Trendify.Modules.Content.Application.Events;

public sealed record ContentReadyEvent(
    Guid TenantId,
    Guid IdeaId,
    string Title,
    string? Script,
    Guid? CampaignId,
    Guid? ProductId
) : DomainEventBase(TenantId);
