using MediatR;
using Trendify.Modules.Learning.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Learning.Application.Commands;

public sealed record ApplyRecommendationCommand(Guid RecommendationId) : IRequest;

public sealed class ApplyRecommendationCommandHandler : IRequestHandler<ApplyRecommendationCommand>
{
    private readonly ILearningRepository _repo;
    private readonly ICurrentUser _currentUser;

    public ApplyRecommendationCommandHandler(ILearningRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(ApplyRecommendationCommand request, CancellationToken ct)
    {
        var rec = await _repo.GetRecommendationByIdAsync(
            request.RecommendationId, _currentUser.TenantId, ct)
            ?? throw new NotFoundException("RECOMMENDATION_NOT_FOUND",
                $"Recommendation {request.RecommendationId} not found.");

        rec.Apply();
        await _repo.SaveChangesAsync(ct);
    }
}
