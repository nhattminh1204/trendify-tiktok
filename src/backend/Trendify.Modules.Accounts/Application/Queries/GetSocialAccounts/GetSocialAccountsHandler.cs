using MediatR;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Queries.GetSocialAccounts;

internal sealed class GetSocialAccountsHandler
    : IRequestHandler<GetSocialAccountsQuery, ApiResponse<List<SocialAccountDto>>>
{
    private readonly IAccountsRepository _repository;
    private readonly ICurrentUser _currentUser;

    public GetSocialAccountsHandler(IAccountsRepository repository, ICurrentUser currentUser)
    {
        _repository = repository;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<SocialAccountDto>>> Handle(
        GetSocialAccountsQuery request, CancellationToken ct)
    {
        var accounts = await _repository.GetSocialAccountsAsync(_currentUser.TenantId, ct);

        var dtos = accounts.Select(a => new SocialAccountDto(
            a.Id,
            a.Platform,
            a.Username,
            a.DisplayName,
            a.ProfileImageUrl,
            a.FollowerCount,
            a.Status,
            a.LastSyncedAt
        )).ToList();

        return ApiResponse<List<SocialAccountDto>>.Ok(dtos);
    }
}
