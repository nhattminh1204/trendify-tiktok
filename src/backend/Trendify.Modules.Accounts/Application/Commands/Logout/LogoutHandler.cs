using MediatR;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Accounts.Application.Commands.Logout;

internal sealed class LogoutHandler : IRequestHandler<LogoutCommand>
{
    private readonly IAccountsRepository _repository;
    private readonly ICurrentUser _currentUser;

    public LogoutHandler(IAccountsRepository repository, ICurrentUser currentUser)
    {
        _repository = repository;
        _currentUser = currentUser;
    }

    public async Task Handle(LogoutCommand request, CancellationToken ct)
    {
        await _repository.RevokeAllUserRefreshTokensAsync(_currentUser.UserId, ct);
    }
}
