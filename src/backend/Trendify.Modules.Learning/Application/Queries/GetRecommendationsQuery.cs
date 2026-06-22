using MediatR;
using Trendify.Modules.Learning.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Learning.Application.Queries;

public sealed record GetRecommendationsQuery(string Status = "pending") : IRequest<List<RecommendationDto>>;

public sealed record RecommendationDto(
    Guid Id,
    string Category,
    string Title,
    string Rationale,
    string ActionableAdvice,
    string Priority,
    decimal Confidence,
    string Status,
    DateTimeOffset? AppliedAt,
    DateTimeOffset ExpiresAt
);

public sealed class GetRecommendationsQueryHandler : IRequestHandler<GetRecommendationsQuery, List<RecommendationDto>>
{
    private readonly ILearningRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetRecommendationsQueryHandler(ILearningRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<RecommendationDto>> Handle(GetRecommendationsQuery request, CancellationToken ct)
    {
        var recs = await _repo.GetRecommendationsAsync(_currentUser.TenantId, request.Status, ct);

        return recs.Select(r => new RecommendationDto(
            r.Id, r.Category, r.Title, r.Rationale, r.ActionableAdvice,
            r.Priority, r.Confidence, r.Status, r.AppliedAt, r.ExpiresAt
        )).ToList();
    }
}
