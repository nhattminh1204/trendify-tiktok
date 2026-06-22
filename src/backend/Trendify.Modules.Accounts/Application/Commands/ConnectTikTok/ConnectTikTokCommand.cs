using MediatR;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.ConnectTikTok;

public sealed record ConnectTikTokCommand(string Code, string RedirectUri, string CodeVerifier)
    : IRequest<ApiResponse<ConnectTikTokResponse>>;

public sealed record ConnectTikTokResponse(
    Guid SocialAccountId,
    string Username,
    string? DisplayName,
    string? ProfileImageUrl,
    long FollowerCount
);
