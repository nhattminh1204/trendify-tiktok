using MediatR;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.Login;

public sealed record GoogleLoginCommand(
    string AccessToken
) : IRequest<ApiResponse<GoogleLoginResponse>>;

public sealed record GoogleLoginResponse(
    Guid UserId,
    Guid TenantId,
    string DisplayName,
    string Email,
    string Role,
    string AccessToken,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt
);
