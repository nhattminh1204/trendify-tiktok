using Trendify.Shared.Events;

namespace Trendify.Modules.Trends.Application.Events;

public sealed record CompetitorAddedEvent(
    Guid TenantId,
    Guid CompetitorId,
    string TikTokUsername
) : DomainEventBase(TenantId);

public sealed record CompetitorRemovedEvent(
    Guid TenantId,
    Guid CompetitorId,
    string TikTokUsername
) : DomainEventBase(TenantId);
