namespace Trendify.Infrastructure.Outbox;

// Adapted from kgrzybek/modular-monolith-with-ddd outbox pattern.
// Guarantees "at-least-once" delivery: domain events are persisted in the same
// DB transaction as the aggregate change, then processed asynchronously.
public sealed class OutboxMessage
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid TenantId { get; private set; }

    // Fully-qualified type name for deserialization
    public string Type { get; private set; } = string.Empty;

    // JSON-serialized domain event
    public string Data { get; private set; } = string.Empty;

    public DateTimeOffset OccurredAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ProcessedAt { get; private set; }
    public string? Error { get; private set; }

    private OutboxMessage() { }

    public static OutboxMessage From(Guid tenantId, string type, string data) =>
        new() { TenantId = tenantId, Type = type, Data = data };

    public void MarkProcessed() => ProcessedAt = DateTimeOffset.UtcNow;

    public void MarkFailed(string error)
    {
        Error = error[..Math.Min(error.Length, 2000)];
        ProcessedAt = DateTimeOffset.UtcNow;
    }
}
