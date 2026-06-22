using MediatR;

namespace Trendify.Shared.Abstractions;

public interface IDomainEvent : INotification
{
    Guid Id { get; }
    DateTimeOffset OccurredAt { get; }
    Guid TenantId { get; }
}

// Dispatcher interface — handlers depend on this, not on MediatR or Outbox directly.
// In-process: MediatREventDispatcher (fast, used in tests)
// Production: OutboxDomainEventDispatcher (durable, via Hangfire)
public interface IDomainEventDispatcher
{
    Task PublishAsync(IDomainEvent domainEvent, CancellationToken ct = default);
    Task PublishAllAsync(IEnumerable<IDomainEvent> domainEvents, CancellationToken ct = default);
}
