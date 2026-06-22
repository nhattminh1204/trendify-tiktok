using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.AIEngine.Domain;

namespace Trendify.Modules.AIEngine.Infrastructure;

public sealed class TokenBudgetService
{
    private readonly AppDbContext _db;

    // Phase 1: hardcoded. Phase 3: read from workspace.plan
    private static readonly Dictionary<string, decimal> _planLimits = new()
    {
        ["free"]   = 2.00m,
        ["pro"]    = 20.00m,
        ["agency"] = 100.00m
    };

    public TokenBudgetService(AppDbContext db) => _db = db;

    public async Task<BudgetCheckResult> CheckAsync(Guid tenantId, CancellationToken ct)
    {
        var startOfMonth = new DateTimeOffset(
            DateTimeOffset.UtcNow.Year, DateTimeOffset.UtcNow.Month, 1, 0, 0, 0, TimeSpan.Zero);

        var spent = await _db.Set<AIUsageLog>()
            .Where(l => l.TenantId == tenantId && l.CreatedAt >= startOfMonth)
            .SumAsync(l => l.EstimatedCostUsd, ct);

        // TODO Phase 3: read plan from workspace
        var limit = _planLimits["pro"];

        return new BudgetCheckResult(spent, limit);
    }
}

public sealed record BudgetCheckResult(decimal SpentUsd, decimal LimitUsd)
{
    public bool IsExceeded => SpentUsd >= LimitUsd;
    public bool IsWarning => SpentUsd >= LimitUsd * 0.8m;
    public decimal RemainingUsd => Math.Max(0, LimitUsd - SpentUsd);
}
