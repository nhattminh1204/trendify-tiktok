using MediatR;
using Trendify.Modules.Analytics.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Analytics.Application.Queries;

public sealed record GetAnalyticsQuery(Guid PostId, int Limit = 30) : IRequest<List<MetricsDto>>;

public sealed record MetricsDto(
    Guid Id,
    Guid PostId,
    long Views,
    long Likes,
    long Comments,
    long Shares,
    long Saves,
    long WatchTimeSeconds,
    decimal EngagementRate,
    decimal RevenueUsd,
    DateTimeOffset RecordedAt
);

public sealed class GetAnalyticsQueryHandler : IRequestHandler<GetAnalyticsQuery, List<MetricsDto>>
{
    private readonly IAnalyticsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetAnalyticsQueryHandler(IAnalyticsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<MetricsDto>> Handle(GetAnalyticsQuery request, CancellationToken ct)
    {
        var metrics = await _repo.GetByPostAsync(
            _currentUser.TenantId, request.PostId, request.Limit, ct);

        return metrics.Select(m => new MetricsDto(
            m.Id, m.PostId, m.Views, m.Likes, m.Comments, m.Shares,
            m.Saves, m.WatchTimeSeconds, m.EngagementRate, m.RevenueUsd, m.RecordedAt
        )).ToList();
    }
}
