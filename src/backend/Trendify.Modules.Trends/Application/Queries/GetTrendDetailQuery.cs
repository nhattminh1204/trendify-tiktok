using MediatR;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Trends.Application.Queries;

public sealed record GetTrendDetailQuery(Guid Id) : IRequest<TrendDto>;

public sealed class GetTrendDetailQueryHandler : IRequestHandler<GetTrendDetailQuery, TrendDto>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetTrendDetailQueryHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<TrendDto> Handle(GetTrendDetailQuery request, CancellationToken ct)
    {
        var trend = await _repo.GetByIdAsync(request.Id, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.TrendNotFound, $"Trend {request.Id} not found.");

        return new TrendDto(
            trend.Id, trend.Keyword, trend.Niche, trend.Platform,
            trend.Score, trend.Status, trend.PeakAt, trend.ExpiresAt, trend.CreatedAt
        );
    }
}
