using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Audience.Domain;

namespace Trendify.Modules.Audience.Infrastructure;

public interface IAudienceRepository
{
    Task<AudienceProfile?> GetProfileAsync(Guid tenantId, Guid socialAccountId, CancellationToken ct);
    Task<AudienceProfile?> GetProfileByIdAsync(Guid id, Guid tenantId, CancellationToken ct);
    Task<List<AudiencePersona>> GetPersonasAsync(Guid profileId, Guid tenantId, CancellationToken ct);
    Task AddProfileAsync(AudienceProfile profile, CancellationToken ct);
    Task AddPersonaAsync(AudiencePersona persona, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

public sealed class AudienceRepository : IAudienceRepository
{
    private readonly AppDbContext _db;

    public AudienceRepository(AppDbContext db) => _db = db;

    public Task<AudienceProfile?> GetProfileAsync(
        Guid tenantId, Guid socialAccountId, CancellationToken ct) =>
        _db.Set<AudienceProfile>()
            .FirstOrDefaultAsync(p => p.TenantId == tenantId
                                   && p.SocialAccountId == socialAccountId, ct);

    public Task<AudienceProfile?> GetProfileByIdAsync(
        Guid id, Guid tenantId, CancellationToken ct) =>
        _db.Set<AudienceProfile>()
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId, ct);

    public Task<List<AudiencePersona>> GetPersonasAsync(
        Guid profileId, Guid tenantId, CancellationToken ct) =>
        _db.Set<AudiencePersona>()
            .Where(p => p.ProfileId == profileId && p.TenantId == tenantId)
            .OrderByDescending(p => p.Percentage)
            .ToListAsync(ct);

    public Task AddProfileAsync(AudienceProfile profile, CancellationToken ct)
    {
        _db.Set<AudienceProfile>().Add(profile);
        return Task.CompletedTask;
    }

    public Task AddPersonaAsync(AudiencePersona persona, CancellationToken ct)
    {
        _db.Set<AudiencePersona>().Add(persona);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
