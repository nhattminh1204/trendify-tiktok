using MediatR;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Accounts.Application.Commands.RegisterWorkspace;

public sealed record RegisterWorkspaceCommand(
    string WorkspaceName,
    string Email,
    string Password,
    string DisplayName
) : IRequest<ApiResponse<RegisterWorkspaceResponse>>;

public sealed record RegisterWorkspaceResponse(
    Guid WorkspaceId,
    Guid UserId,
    string AccessToken,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt
);
