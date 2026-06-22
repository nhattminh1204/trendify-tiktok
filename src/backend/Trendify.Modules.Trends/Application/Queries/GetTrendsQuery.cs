using MediatR;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Trends.Application.Queries;

public sealed record GetTrendsQuery(
    string? Niche = null,
    int Limit = 20
) : IRequest<List<TrendDto>>;

public sealed record TrendDto(
    Guid Id,
    string Keyword,
    string Niche,
    string Platform,
    decimal Score,
    string Status,
    DateTimeOffset? PeakAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset CreatedAt
);

public sealed class GetTrendsQueryHandler : IRequestHandler<GetTrendsQuery, List<TrendDto>>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetTrendsQueryHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<TrendDto>> Handle(GetTrendsQuery request, CancellationToken ct)
    {
        var trends = await _repo.GetActiveAsync(
            _currentUser.TenantId, request.Niche, request.Limit, ct);

        return trends.Select(t => new TrendDto(
            t.Id, t.Keyword, t.Niche, t.Platform,
            t.Score, t.Status, t.PeakAt, t.ExpiresAt, t.CreatedAt
        )).ToList();
    }
}
