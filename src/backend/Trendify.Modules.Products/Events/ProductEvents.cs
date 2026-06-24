using Trendify.Shared.Events;

namespace Trendify.Modules.Products.Events;

public sealed record ProductAddedEvent(
    Guid TenantId,
    Guid ProductId,
    string ProductName,
    string? AffiliateLink
) : DomainEventBase(TenantId);

public sealed record ProductDelistedEvent(
    Guid TenantId,
    Guid ProductId,
    string ProductName
) : DomainEventBase(TenantId);

public sealed record HighOpportunityProductDetectedEvent(
    Guid TenantId,
    Guid ProductId,
    string ProductName,
    decimal Score
) : DomainEventBase(TenantId);
