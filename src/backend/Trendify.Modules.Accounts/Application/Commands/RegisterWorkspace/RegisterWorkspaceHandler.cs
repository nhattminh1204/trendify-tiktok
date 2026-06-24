using MediatR;
using Trendify.Infrastructure.Auth;
using Trendify.Modules.Accounts.Application.Events;
using Trendify.Modules.Accounts.Domain;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.RegisterWorkspace;

internal sealed class RegisterWorkspaceHandler
    : IRequestHandler<RegisterWorkspaceCommand, ApiResponse<RegisterWorkspaceResponse>>
{
    private readonly IAccountsRepository _repository;
    private readonly JwtService _jwtService;
    private readonly IDomainEventDispatcher _events;

    public RegisterWorkspaceHandler(
        IAccountsRepository repository,
        JwtService jwtService,
        IDomainEventDispatcher events)
    {
        _repository = repository;
        _jwtService = jwtService;
        _events = events;
    }

    public async Task<ApiResponse<RegisterWorkspaceResponse>> Handle(
        RegisterWorkspaceCommand request,
        CancellationToken ct)
    {
        var emailExists = await _repository.EmailExistsAsync(request.Email, ct);
        if (emailExists)
            throw new ConflictException(ErrorCodes.DuplicateEmail, "An account with this email already exists.");

        var slug = GenerateSlug(request.WorkspaceName);
        var workspace = Workspace.Create(request.WorkspaceName, slug);

        var passwordHash = User.HashPassword(request.Password);
        var user = User.Create(workspace.Id, request.Email, passwordHash, request.DisplayName);

        var accessToken = _jwtService.GenerateAccessToken(user.Id, workspace.Id, user.Email, user.Role);
        var refreshToken = _jwtService.GenerateRefreshToken();
        user.SetRefreshToken(refreshToken, _jwtService.RefreshTokenTtlDays);

        await _repository.CreateWorkspaceAsync(workspace, user, ct);

        await _events.PublishAsync(new AccountCreatedEvent(workspace.Id, user.Id, user.Email), ct);

        return ApiResponse<RegisterWorkspaceResponse>.Ok(new RegisterWorkspaceResponse(
            workspace.Id,
            user.Id,
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
