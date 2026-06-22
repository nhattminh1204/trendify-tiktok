using MediatR;
using Trendify.Shared.Abstractions;

namespace Trendify.Infrastructure.Messaging;

// In-process dispatcher — used in unit tests and anywhere durability isn't needed.
public sealed class MediatREventDispatcher : IDomainEventDispatcher
{
    private readonly IPublisher _publisher;

    public MediatREventDispatcher(IPublisher publisher)
    {
        _publisher = publisher;
    }

    public async Task PublishAsync(IDomainEvent domainEvent, CancellationToken ct = default)
    {
        await _publisher.Publish(domainEvent, ct);
    }

    public async Task PublishAllAsync(IEnumerable<IDomainEvent> events, CancellationToken ct = default)
    {
        foreach (var @event in events)
            await _publisher.Publish(@event, ct);
    }
}
