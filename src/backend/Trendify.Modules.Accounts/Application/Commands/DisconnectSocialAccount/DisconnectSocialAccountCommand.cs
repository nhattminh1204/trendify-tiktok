using MediatR;

namespace Trendify.Modules.Accounts.Application.Commands.DisconnectSocialAccount;

public sealed record DisconnectSocialAccountCommand(Guid SocialAccountId) : IRequest;
