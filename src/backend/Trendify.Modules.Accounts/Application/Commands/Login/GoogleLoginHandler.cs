using MediatR;
using Microsoft.Extensions.Configuration;
using Trendify.Infrastructure.Auth;
using Trendify.Modules.Accounts.Application.Events;
using Trendify.Modules.Accounts.Domain;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.Login;

internal sealed class GoogleLoginHandler : IRequestHandler<GoogleLoginCommand, ApiResponse<GoogleLoginResponse>>
{
    private readonly IAccountsRepository _repository;
    private readonly JwtService _jwtService;
    private readonly IDomainEventDispatcher _events;
    private readonly IConfiguration _configuration;

    public GoogleLoginHandler(
        IAccountsRepository repository,
        JwtService jwtService,
        IDomainEventDispatcher events,
        IConfiguration configuration)
    {
        _repository = repository;
        _jwtService = jwtService;
        _events = events;
        _configuration = configuration;
    }

    public async Task<ApiResponse<GoogleLoginResponse>> Handle(GoogleLoginCommand request, CancellationToken ct)
    {
        GoogleUserInfo? userInfo = null;
        try
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.AccessToken);
            var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo", ct);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(ct);
                userInfo = System.Text.Json.JsonSerializer.Deserialize<GoogleUserInfo>(content, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
        }
        catch { }

        if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
        {
            throw new UnauthorizedException(ErrorCodes.InvalidCredentials);
        }

        var user = await _repository.FindUserByEmailAsync(userInfo.Email, ct);
        var isNewUser = false;
        Guid workspaceId;

        if (user is null)
        {
            // Auto-register
            var workspaceName = userInfo.Name ?? userInfo.Email.Split('@')[0];
            var slug = GenerateSlug(workspaceName);
            var workspace = Workspace.Create(workspaceName, slug);
            workspaceId = workspace.Id;

            // Generate a random password since they login via Google
            var randomPassword = Guid.NewGuid().ToString();
            var passwordHash = User.HashPassword(randomPassword);
            user = User.Create(workspace.Id, userInfo.Email, passwordHash, userInfo.Name ?? workspaceName);
            
            await _repository.CreateWorkspaceAsync(workspace, user, ct);
            isNewUser = true;
        }
        else
        {
            workspaceId = user.TenantId;
            if (!user.IsActive)
                throw new ForbiddenException("Account is disabled.");
        }

        var accessToken = _jwtService.GenerateAccessToken(user.Id, workspaceId, user.Email, user.Role);
        var refreshToken = _jwtService.GenerateRefreshToken();
        user.SetRefreshToken(refreshToken, _jwtService.RefreshTokenTtlDays);

        if (!isNewUser)
        {
            user.RecordLogin();
            await _repository.UpdateUserAsync(user, ct);
        }

        if (isNewUser)
        {
            await _events.PublishAsync(new AccountCreatedEvent(workspaceId, user.Id, user.Email), ct);
        }

        return ApiResponse<GoogleLoginResponse>.Ok(new GoogleLoginResponse(
            user.Id,
            workspaceId,
            user.DisplayName,
            user.Email,
            user.Role,
            accessToken,
            refreshToken,
            user.LatestRefreshTokenExpiresAt!.Value
        ));
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.Trim().ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-");

        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-").Trim('-');

        return $"{slug}-{Guid.NewGuid().ToString("N")[..6]}";
    }
}

public class GoogleUserInfo
{
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
}
