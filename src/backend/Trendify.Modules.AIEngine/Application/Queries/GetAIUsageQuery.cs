using MediatR;
using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.AIEngine.Domain;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.AIEngine.Application.Queries;

public sealed record GetAIUsageQuery(int Limit = 50) : IRequest<List<AIUsageDto>>;

public sealed record AIUsageDto(
    Guid Id,
    string FeatureContext,
    string Provider,
    string Model,
    int PromptTokens,
    int CompletionTokens,
    decimal EstimatedCostUsd,
    int DurationMs,
    string Status,
    DateTimeOffset CreatedAt
);

public sealed class GetAIUsageQueryHandler : IRequestHandler<GetAIUsageQuery, List<AIUsageDto>>
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetAIUsageQueryHandler(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<AIUsageDto>> Handle(GetAIUsageQuery request, CancellationToken ct)
    {
        return await _db.Set<AIUsageLog>()
            .Where(l => l.TenantId == _currentUser.TenantId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(Math.Clamp(request.Limit, 1, 200))
            .Select(l => new AIUsageDto(
                l.Id,
                l.FeatureContext,
                l.Provider,
                l.Model,
                l.PromptTokens,
                l.CompletionTokens,
                l.EstimatedCostUsd,
                l.DurationMs,
                l.Status,
                l.CreatedAt
            ))
            .ToListAsync(ct);
    }
}
