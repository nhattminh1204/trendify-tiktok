using Trendify.Modules.Accounts.Domain;

namespace Trendify.Modules.Accounts.Infrastructure;

public interface IAccountsRepository
{
    Task<bool> EmailExistsAsync(string email, CancellationToken ct);
    Task CreateWorkspaceAsync(Workspace workspace, User user, CancellationToken ct);
    Task<User?> FindUserByEmailAsync(string email, CancellationToken ct);
    Task<User?> FindUserByRefreshTokenAsync(string refreshToken, CancellationToken ct);
    Task UpdateUserAsync(User user, CancellationToken ct);
    Task<List<SocialAccount>> GetSocialAccountsAsync(Guid tenantId, CancellationToken ct);
    Task<SocialAccount?> FindSocialAccountByPlatformIdAsync(Guid tenantId, string platform, string platformUserId, CancellationToken ct);
    Task CreateSocialAccountAsync(SocialAccount account, CancellationToken ct);
    Task UpdateSocialAccountAsync(SocialAccount account, CancellationToken ct);
    Task<Workspace?> GetWorkspaceAsync(Guid tenantId, CancellationToken ct);
}
