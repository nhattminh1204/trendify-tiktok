using Trendify.Shared.Events;

namespace Trendify.Modules.Accounts.Application.Events;

public sealed record AccountCreatedEvent(
    Guid TenantId,
    Guid UserId,
    string Email
) : DomainEventBase(TenantId);
