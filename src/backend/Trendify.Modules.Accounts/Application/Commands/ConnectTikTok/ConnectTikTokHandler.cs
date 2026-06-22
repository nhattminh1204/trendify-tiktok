using MediatR;
using Trendify.Modules.Accounts.Application.Events;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Modules.Accounts.Infrastructure.TikTok;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.ConnectTikTok;

internal sealed class ConnectTikTokHandler
    : IRequestHandler<ConnectTikTokCommand, ApiResponse<ConnectTikTokResponse>>
{
    private readonly IAccountsRepository _repository;
    private readonly TikTokOAuthService _tikTok;
    private readonly ICurrentUser _currentUser;
    private readonly IDomainEventDispatcher _events;

    public ConnectTikTokHandler(
        IAccountsRepository repository,
        TikTokOAuthService tikTok,
        ICurrentUser currentUser,
        IDomainEventDispatcher events)
    {
        _repository = repository;
        _tikTok = tikTok;
        _currentUser = currentUser;
        _events = events;
    }

    public async Task<ApiResponse<ConnectTikTokResponse>> Handle(
        ConnectTikTokCommand request, CancellationToken ct)
    {
        // Exchange code for TikTok tokens (PKCE: code_verifier must match the challenge sent in auth URL)
        var tokenResult = await _tikTok.ExchangeCodeForTokensAsync(
            request.Code, request.RedirectUri, request.CodeVerifier, ct);

        // Check if this TikTok account is already connected in this workspace
        var existing = await _repository.FindSocialAccountByPlatformIdAsync(
            _currentUser.TenantId, "tiktok", tokenResult.OpenId, ct);

        if (existing is not null)
            throw new ConflictException(ErrorCodes.SocialAccountAlreadyConnected,
                "This TikTok account is already connected.");

        // Fetch profile info
        var profile = await _tikTok.GetUserProfileAsync(tokenResult.AccessToken, ct);

        // Build domain entity with encrypted tokens
        var account = Domain.SocialAccount.Connect(
            tenantId: _currentUser.TenantId,
            platform: "tiktok",
            platformUserId: tokenResult.OpenId,
            username: profile.Username,
            displayName: profile.DisplayName,
            profileImageUrl: profile.AvatarUrl,
            accessTokenEncrypted: tokenResult.AccessTokenEncrypted,
            refreshTokenEncrypted: tokenResult.RefreshTokenEncrypted,
            tokenExpiresAt: tokenResult.ExpiresAt,
            followerCount: profile.FollowerCount
        );

        await _repository.CreateSocialAccountAsync(account, ct);

        await _events.PublishAsync(
            new SocialAccountConnectedEvent(_currentUser.TenantId, account.Id, "tiktok"), ct);

        return ApiResponse<ConnectTikTokResponse>.Ok(new ConnectTikTokResponse(
            account.Id,
            account.Username,
            account.DisplayName,
            account.ProfileImageUrl,
            account.FollowerCount
        ));
    }
}
