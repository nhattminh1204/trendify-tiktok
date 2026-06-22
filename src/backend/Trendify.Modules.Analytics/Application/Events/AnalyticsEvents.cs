using Trendify.Shared.Events;

namespace Trendify.Modules.Analytics.Application.Events;

public sealed record PerformanceMilestoneReachedEvent(
    Guid TenantId,
    Guid PostId,
    long ViewsMilestone
) : DomainEventBase(TenantId);

public sealed record LowPerformanceDetectedEvent(
    Guid TenantId,
    Guid PostId,
    long ViewsAfter24Hours
) : DomainEventBase(TenantId);
