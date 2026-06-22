using MediatR;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.RefreshToken;

public sealed record RefreshTokenCommand(string RefreshToken) : IRequest<ApiResponse<RefreshTokenResponse>>;

public sealed record RefreshTokenResponse(
    string AccessToken,
    string RefreshToken,
    DateTimeOffset ExpiresAt
);
