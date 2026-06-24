using MediatR;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Trends.Application.Queries;

public sealed record GetWatchlistQuery : IRequest<List<WatchlistItemDto>>;

public sealed record WatchlistItemDto(
    Guid Id,
    Guid TrendDetectionId,
    string Keyword,
    string Niche,
    decimal Score,
    string Status,
    string? Notes,
    DateTimeOffset CreatedAt
);

public sealed class GetWatchlistQueryHandler : IRequestHandler<GetWatchlistQuery, List<WatchlistItemDto>>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetWatchlistQueryHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<WatchlistItemDto>> Handle(GetWatchlistQuery request, CancellationToken ct)
    {
        var items = await _repo.GetWatchlistAsync(_currentUser.TenantId, ct);

        var result = new List<WatchlistItemDto>();
        foreach (var item in items)
        {
            var trend = await _repo.GetByIdAsync(item.TrendDetectionId, _currentUser.TenantId, ct);
            result.Add(new WatchlistItemDto(
                item.Id,
                item.TrendDetectionId,
                trend?.Keyword ?? "Unknown",
                trend?.Niche ?? "",
                trend?.Score ?? 0,
                trend?.Status ?? "expired",
                item.Notes,
                item.CreatedAt
            ));
        }

        return result;
    }
}
