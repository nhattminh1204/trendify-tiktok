using MediatR;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Queries.GetSocialAccounts;

public sealed record GetSocialAccountsQuery : IRequest<ApiResponse<List<SocialAccountDto>>>;

public sealed record SocialAccountDto(
    Guid Id,
    string Platform,
    string Username,
    string? DisplayName,
    string? ProfileImageUrl,
    long FollowerCount,
    string Status,
    DateTimeOffset? LastSyncedAt
);
