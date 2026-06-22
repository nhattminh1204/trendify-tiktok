using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Content.Domain;

namespace Trendify.Modules.Content.Infrastructure;

public interface IContentRepository
{
    Task<ContentIdea?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken ct);
    Task<List<ContentIdea>> GetByStatusAsync(Guid tenantId, string? status, int limit, CancellationToken ct);
    Task AddAsync(ContentIdea idea, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

public sealed class ContentRepository : IContentRepository
{
    private readonly AppDbContext _db;

    public ContentRepository(AppDbContext db) => _db = db;

    public Task<ContentIdea?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken ct) =>
        _db.Set<ContentIdea>()
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, ct);

    public Task<List<ContentIdea>> GetByStatusAsync(
        Guid tenantId, string? status, int limit, CancellationToken ct)
    {
        var q = _db.Set<ContentIdea>().Where(x => x.TenantId == tenantId);

        if (!string.IsNullOrEmpty(status))
            q = q.Where(x => x.Status == status);

        return q.OrderByDescending(x => x.CreatedAt)
                .Take(Math.Clamp(limit, 1, 100))
                .ToListAsync(ct);
    }

    public Task AddAsync(ContentIdea idea, CancellationToken ct)
    {
        _db.Set<ContentIdea>().Add(idea);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
