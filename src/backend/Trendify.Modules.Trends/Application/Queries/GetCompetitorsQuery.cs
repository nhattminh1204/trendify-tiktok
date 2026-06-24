using MediatR;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Trends.Application.Queries;

public sealed record GetCompetitorsQuery : IRequest<List<CompetitorDto>>;

public sealed record CompetitorDto(
    Guid Id,
    string TikTokUsername,
    string? DisplayName,
    string? AvatarUrl,
    long? FollowerCount,
    string? Notes,
    DateTimeOffset? LastScannedAt,
    DateTimeOffset CreatedAt
);

public sealed class GetCompetitorsQueryHandler : IRequestHandler<GetCompetitorsQuery, List<CompetitorDto>>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetCompetitorsQueryHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<CompetitorDto>> Handle(GetCompetitorsQuery request, CancellationToken ct)
    {
        var competitors = await _repo.GetCompetitorsAsync(_currentUser.TenantId, ct);

        return competitors.Select(c => new CompetitorDto(
            c.Id,
            c.TikTokUsername,
            c.DisplayName,
            c.AvatarUrl,
            c.FollowerCount,
            c.Notes,
            c.LastScannedAt,
            c.CreatedAt
        )).ToList();
    }
}
