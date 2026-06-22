using Trendify.Shared.Abstractions;

namespace Trendify.Shared.Events;

public abstract record DomainEventBase : IDomainEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
    public Guid TenantId { get; init; }

    protected DomainEventBase(Guid tenantId)
    {
        TenantId = tenantId;
    }
}
