using MediatR;
using Trendify.Modules.Learning.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Learning.Application.Queries;

public sealed record GetPatternsQuery(string? Niche = null) : IRequest<List<PatternDto>>;

public sealed record PatternDto(
    Guid Id,
    string Niche,
    string PatternType,
    string Name,
    string Description,
    decimal AvgEngagementRate,
    int SampleSize,
    decimal Confidence,
    string[] Tags
);

public sealed class GetPatternsQueryHandler : IRequestHandler<GetPatternsQuery, List<PatternDto>>
{
    private readonly ILearningRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetPatternsQueryHandler(ILearningRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<PatternDto>> Handle(GetPatternsQuery request, CancellationToken ct)
    {
        var patterns = await _repo.GetPatternsAsync(_currentUser.TenantId, request.Niche, ct);

        return patterns.Select(p => new PatternDto(
            p.Id, p.Niche, p.PatternType, p.Name, p.Description,
            p.AvgEngagementRate, p.SampleSize, p.Confidence, p.Tags
        )).ToList();
    }
}
