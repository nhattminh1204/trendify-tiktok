using System.Text.Json;
using Trendify.Infrastructure.Persistence;
using Trendify.Shared.Abstractions;

namespace Trendify.Infrastructure.Outbox;

// Durable dispatcher — saves events to outbox_messages in the same EF transaction.
// OutboxProcessor (Hangfire job) publishes them async. Prevents lost events on crash.
public sealed class OutboxDomainEventDispatcher : IDomainEventDispatcher
{
    private readonly AppDbContext _db;

    public OutboxDomainEventDispatcher(AppDbContext db) => _db = db;

    public Task PublishAsync(IDomainEvent domainEvent, CancellationToken ct = default)
    {
        var type = domainEvent.GetType().AssemblyQualifiedName
            ?? domainEvent.GetType().FullName!;

        var data = JsonSerializer.Serialize(domainEvent,
            domainEvent.GetType(),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        _db.Set<OutboxMessage>().Add(OutboxMessage.From(domainEvent.TenantId, type, data));
        return Task.CompletedTask;
    }

    public async Task PublishAllAsync(IEnumerable<IDomainEvent> domainEvents, CancellationToken ct = default)
    {
        foreach (var e in domainEvents)
            await PublishAsync(e, ct);
    }
}
