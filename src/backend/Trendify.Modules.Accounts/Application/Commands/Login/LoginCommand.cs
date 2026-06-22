using MediatR;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.Login;

public sealed record LoginCommand(
    string Email,
    string Password
) : IRequest<ApiResponse<LoginResponse>>;

public sealed record LoginResponse(
    Guid UserId,
    Guid TenantId,
    string DisplayName,
    string Email,
    string Role,
    string AccessToken,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt
);
