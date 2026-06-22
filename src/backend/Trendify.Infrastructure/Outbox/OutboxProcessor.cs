using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.Persistence;
using Trendify.Shared.Abstractions;

namespace Trendify.Infrastructure.Outbox;

// Adapted from kgrzybek/modular-monolith-with-ddd ProcessOutboxCommandHandler.
// Runs as a Hangfire recurring job every 10s — picks up unprocessed messages and
// publishes them via MediatR. At-least-once guarantee: only marks processed after publish.
public sealed class OutboxProcessor
{
    private readonly AppDbContext _db;
    private readonly IPublisher _publisher;
    private readonly ILogger<OutboxProcessor> _logger;

    // Hard cap per run — prevents a huge backlog from blocking the job for minutes
    private const int BatchSize = 50;

    public OutboxProcessor(AppDbContext db, IPublisher publisher, ILogger<OutboxProcessor> logger)
    {
        _db = db;
        _publisher = publisher;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken ct = default)
    {
        var messages = await _db.Set<OutboxMessage>()
            .Where(m => m.ProcessedAt == null)
            .OrderBy(m => m.OccurredAt)
            .Take(BatchSize)
            .ToListAsync(ct);

        if (messages.Count == 0) return;

        _logger.LogInformation("OutboxProcessor: processing {Count} messages.", messages.Count);

        foreach (var msg in messages)
        {
            try
            {
                var type = Type.GetType(msg.Type);
                if (type is null)
                {
                    msg.MarkFailed($"Cannot resolve type: {msg.Type}");
                    _logger.LogWarning("OutboxProcessor: unknown type {Type}", msg.Type);
                    continue;
                }

                var notification = JsonSerializer.Deserialize(msg.Data, type,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                    as INotification;

                if (notification is null)
                {
                    msg.MarkFailed("Deserialization returned null.");
                    continue;
                }

                await _publisher.Publish(notification, ct);
                msg.MarkProcessed();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OutboxProcessor: failed to process message {Id}", msg.Id);
                msg.MarkFailed(ex.Message);
            }
        }

        await _db.SaveChangesAsync(ct);
    }
}
