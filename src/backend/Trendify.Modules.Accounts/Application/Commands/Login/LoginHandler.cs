using MediatR;
using Trendify.Infrastructure.Auth;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Shared.Errors;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.Login;

internal sealed class LoginHandler : IRequestHandler<LoginCommand, ApiResponse<LoginResponse>>
{
    private readonly IAccountsRepository _repository;
    private readonly JwtService _jwtService;

    public LoginHandler(IAccountsRepository repository, JwtService jwtService)
    {
        _repository = repository;
        _jwtService = jwtService;
    }

    public async Task<ApiResponse<LoginResponse>> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _repository.FindUserByEmailAsync(request.Email, ct);

        if (user is null || !user.VerifyPassword(request.Password))
            throw new UnauthorizedException(ErrorCodes.InvalidCredentials);

        if (!user.IsActive)
            throw new ForbiddenException("Account is disabled.");

        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.TenantId, user.Email, user.Role);
        var refreshToken = _jwtService.GenerateRefreshToken();
        user.SetRefreshToken(refreshToken, 7);
        user.RecordLogin();

        await _repository.UpdateUserAsync(user, ct);

        return ApiResponse<LoginResponse>.Ok(new LoginResponse(
            user.Id,
            user.TenantId,
            user.DisplayName,
            user.Email,
            user.Role,
            accessToken,
            refreshToken,
            user.RefreshTokenExpiresAt!.Value
        ));
    }
}
