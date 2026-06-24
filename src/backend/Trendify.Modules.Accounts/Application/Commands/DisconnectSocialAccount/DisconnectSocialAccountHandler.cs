using MediatR;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Accounts.Application.Commands.DisconnectSocialAccount;

internal sealed class DisconnectSocialAccountHandler
    : IRequestHandler<DisconnectSocialAccountCommand>
{
    private readonly IAccountsRepository _repository;
    private readonly ICurrentUser _currentUser;

    public DisconnectSocialAccountHandler(
        IAccountsRepository repository,
        ICurrentUser currentUser)
    {
        _repository = repository;
        _currentUser = currentUser;
    }

    public async Task Handle(DisconnectSocialAccountCommand request, CancellationToken ct)
    {
        var account = await _repository.FindSocialAccountByIdAsync(
            _currentUser.TenantId, request.SocialAccountId, ct);
        if (account is null)
            throw new NotFoundException(ErrorCodes.SocialAccountNotFound, "Social account not found.");

        account.Disconnect();
        await _repository.UpdateSocialAccountAsync(account, ct);
    }
}
