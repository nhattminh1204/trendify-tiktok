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
        await _db.SaveChangesAsync(ct);
    }

    public async Task<User?> FindUserByEmailAsync(string email, CancellationToken ct) =>
        await _db.Set<User>()
            .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant() && u.DeletedAt == null, ct);

    public async Task<User?> FindUserByRefreshTokenAsync(string refreshToken, CancellationToken ct) =>
        await _db.Set<User>()
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && u.DeletedAt == null, ct);

    public async Task UpdateUserAsync(User user, CancellationToken ct)
    {
        _db.Set<User>().Update(user);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<SocialAccount>> GetSocialAccountsAsync(Guid tenantId, CancellationToken ct) =>
        await _db.Set<SocialAccount>()
            .Where(a => a.TenantId == tenantId && a.DeletedAt == null)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

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
}
