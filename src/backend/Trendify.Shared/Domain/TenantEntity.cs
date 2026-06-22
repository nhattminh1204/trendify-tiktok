namespace Trendify.Shared.Domain;

public abstract class TenantEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public Guid TenantId { get; protected set; }
    public DateTimeOffset CreatedAt { get; protected set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; protected set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? DeletedAt { get; protected set; }

    public bool IsDeleted => DeletedAt.HasValue;

    protected void MarkUpdated() => UpdatedAt = DateTimeOffset.UtcNow;

    public void SoftDelete()
    {
        DeletedAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }
}
