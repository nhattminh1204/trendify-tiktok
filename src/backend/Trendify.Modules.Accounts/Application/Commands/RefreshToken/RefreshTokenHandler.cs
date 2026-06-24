using MediatR;
using Trendify.Infrastructure.Auth;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Shared.Errors;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.RefreshToken;

internal sealed class RefreshTokenHandler
    : IRequestHandler<RefreshTokenCommand, ApiResponse<RefreshTokenResponse>>
{
    private readonly IAccountsRepository _repository;
    private readonly JwtService _jwtService;

    public RefreshTokenHandler(IAccountsRepository repository, JwtService jwtService)
    {
        _repository = repository;
        _jwtService = jwtService;
    }

    public async Task<ApiResponse<RefreshTokenResponse>> Handle(
        RefreshTokenCommand request, CancellationToken ct)
    {
        var user = await _repository.FindUserByRefreshTokenAsync(request.RefreshToken, ct);

        if (user is null)
            throw new UnauthorizedException(ErrorCodes.InvalidToken);

        // Revoke the used refresh token (rotation)
        await _repository.RevokeRefreshTokenAsync(request.RefreshToken, ct);

        var newAccessToken = _jwtService.GenerateAccessToken(user.Id, user.TenantId, user.Email, user.Role);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        user.SetRefreshToken(newRefreshToken, _jwtService.RefreshTokenTtlDays);

        await _repository.UpdateUserAsync(user, ct);

        return ApiResponse<RefreshTokenResponse>.Ok(new RefreshTokenResponse(
            newAccessToken,
            newRefreshToken,
            user.LatestRefreshTokenExpiresAt!.Value
        ));
    }
}
