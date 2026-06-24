using Trendify.Shared.Events;

namespace Trendify.Modules.Trends.Application.Events;

public sealed record TrendDetectedEvent(
    Guid TenantId,
    Guid TrendId,
    string Keyword,
    decimal Score
) : DomainEventBase(TenantId);

public sealed record TrendPeakedEvent(
    Guid TenantId,
    Guid TrendId,
    string Keyword,
    decimal Score
) : DomainEventBase(TenantId);

public sealed record TrendWatchlistItemAddedEvent(
    Guid TenantId,
    Guid TrendDetectionId,
    string Keyword
) : DomainEventBase(TenantId);

public sealed record TrendDecliningEvent(
    Guid TenantId,
    Guid TrendId,
    string Keyword,
    decimal PreviousScore,
    decimal CurrentScore
) : DomainEventBase(TenantId);
