using Trendify.Shared.Events;

namespace Trendify.Modules.Accounts.Application.Events;

public sealed record SocialAccountConnectedEvent(
    Guid TenantId,
    Guid SocialAccountId,
    string Platform
) : DomainEventBase(TenantId);

public sealed record SocialAccountDisconnectedEvent(
    Guid TenantId,
    Guid SocialAccountId,
    string Platform
) : DomainEventBase(TenantId);
