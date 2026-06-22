using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Learning.Domain;

namespace Trendify.Modules.Learning.Infrastructure;

public interface ILearningRepository
{
    Task<List<ContentPattern>> GetPatternsAsync(Guid tenantId, string? niche, CancellationToken ct);
    Task<List<ImprovementRecommendation>> GetRecommendationsAsync(Guid tenantId, string status, CancellationToken ct);
    Task AddPatternAsync(ContentPattern pattern, CancellationToken ct);
    Task AddRecommendationAsync(ImprovementRecommendation rec, CancellationToken ct);
    Task<ImprovementRecommendation?> GetRecommendationByIdAsync(Guid id, Guid tenantId, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

public sealed class LearningRepository : ILearningRepository
{
    private readonly AppDbContext _db;

    public LearningRepository(AppDbContext db) => _db = db;

    public Task<List<ContentPattern>> GetPatternsAsync(
        Guid tenantId, string? niche, CancellationToken ct)
    {
        var q = _db.Set<ContentPattern>()
            .Where(p => p.TenantId == tenantId && p.Status == "active");

        if (!string.IsNullOrEmpty(niche))
            q = q.Where(p => p.Niche == niche);

        return q.OrderByDescending(p => p.Confidence).ToListAsync(ct);
    }

    public Task<List<ImprovementRecommendation>> GetRecommendationsAsync(
        Guid tenantId, string status, CancellationToken ct) =>
        _db.Set<ImprovementRecommendation>()
            .Where(r => r.TenantId == tenantId && r.Status == status)
            .OrderBy(r => r.Priority == "high" ? 0 : r.Priority == "medium" ? 1 : 2)
            .ThenByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

    public Task AddPatternAsync(ContentPattern pattern, CancellationToken ct)
    {
        _db.Set<ContentPattern>().Add(pattern);
        return Task.CompletedTask;
    }

    public Task AddRecommendationAsync(ImprovementRecommendation rec, CancellationToken ct)
    {
        _db.Set<ImprovementRecommendation>().Add(rec);
        return Task.CompletedTask;
    }

    public Task<ImprovementRecommendation?> GetRecommendationByIdAsync(
        Guid id, Guid tenantId, CancellationToken ct) =>
        _db.Set<ImprovementRecommendation>()
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId, ct);

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
