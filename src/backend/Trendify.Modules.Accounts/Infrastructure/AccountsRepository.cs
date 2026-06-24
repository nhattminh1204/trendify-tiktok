using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Accounts.Domain;

namespace Trendify.Modules.Accounts.Infrastructure;

internal sealed class AccountsRepository : IAccountsRepository
{
    private readonly AppDbContext _db;

    public AccountsRepository(AppDbContext db) => _db = db;

    public async Task<bool> EmailExistsAsync(string email, CancellationToken ct) =>
        await _db.Set<User>()
            .AnyAsync(u => u.Email == email.ToLowerInvariant() && u.DeletedAt == null, ct);

    public async Task CreateWorkspaceAsync(Workspace workspace, User user, CancellationToken ct)
    {
        await _db.Set<Workspace>().AddAsync(workspace, ct);
        await _db.Set<User>().AddAsync(user, ct);
        await SaveRefreshTokenIfNeededAsync(user, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<User?> FindUserByEmailAsync(string email, CancellationToken ct) =>
        await _db.Set<User>()
            .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant() && u.DeletedAt == null, ct);

    public async Task<User?> FindUserByIdAsync(Guid userId, CancellationToken ct) =>
        await _db.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null, ct);

    public async Task<User?> FindUserByRefreshTokenAsync(string refreshToken, CancellationToken ct)
    {
        var token = await _db.Set<UserRefreshToken>()
            .FirstOrDefaultAsync(t => t.Token == refreshToken && t.RevokedAt == null && !t.IsExpired, ct);

        if (token == null) return null;

        return await _db.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == token.UserId && u.DeletedAt == null, ct);
    }

    public async Task UpdateUserAsync(User user, CancellationToken ct)
    {
        _db.Set<User>().Update(user);
        await SaveRefreshTokenIfNeededAsync(user, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken ct)
    {
        var token = await _db.Set<UserRefreshToken>()
            .FirstOrDefaultAsync(t => t.Token == refreshToken, ct);

        if (token != null)
        {
            token.Revoke();
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task RevokeAllUserRefreshTokensAsync(Guid userId, CancellationToken ct)
    {
        var tokens = await _db.Set<UserRefreshToken>()
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync(ct);

        foreach (var t in tokens)
            t.Revoke();

        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<SocialAccount>> GetSocialAccountsAsync(Guid tenantId, CancellationToken ct) =>
        await _db.Set<SocialAccount>()
            .Where(a => a.TenantId == tenantId && a.DeletedAt == null)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

    public async Task<SocialAccount?> FindSocialAccountByIdAsync(
        Guid tenantId, Guid id, CancellationToken ct) =>
        await _db.Set<SocialAccount>()
            .FirstOrDefaultAsync(a =>
                a.Id == id &&
                a.TenantId == tenantId &&
                a.DeletedAt == null, ct);

    public async Task<SocialAccount?> FindSocialAccountByPlatformIdAsync(
        Guid tenantId, string platform, string platformUserId, CancellationToken ct) =>
        await _db.Set<SocialAccount>()
            .FirstOrDefaultAsync(a =>
                a.TenantId == tenantId &&
                a.Platform == platform &&
                a.PlatformUserId == platformUserId &&
                a.DeletedAt == null, ct);

    public async Task CreateSocialAccountAsync(SocialAccount account, CancellationToken ct)
    {
        await _db.Set<SocialAccount>().AddAsync(account, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateSocialAccountAsync(SocialAccount account, CancellationToken ct)
    {
        _db.Set<SocialAccount>().Update(account);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<Workspace?> GetWorkspaceAsync(Guid tenantId, CancellationToken ct) =>
        await _db.Set<Workspace>()
            .FirstOrDefaultAsync(w => w.Id == tenantId && w.DeletedAt == null, ct);

    private async Task SaveRefreshTokenIfNeededAsync(User user, CancellationToken ct)
    {
        if (user.LatestRefreshToken == null) return;

        var expiresAt = user.LatestRefreshTokenExpiresAt ?? DateTimeOffset.UtcNow.AddDays(7);
        var days = Math.Max(1, (int)(expiresAt - DateTimeOffset.UtcNow).TotalDays);
        var rt = UserRefreshToken.Create(user.Id, user.TenantId, user.LatestRefreshToken, days);
        await _db.Set<UserRefreshToken>().AddAsync(rt, ct);
    }
}
