using MediatR;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Trends.Application.Commands;

public sealed record RemoveCompetitorCommand(Guid CompetitorId) : IRequest;

public sealed class RemoveCompetitorCommandHandler : IRequestHandler<RemoveCompetitorCommand>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public RemoveCompetitorCommandHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(RemoveCompetitorCommand request, CancellationToken ct)
    {
        var competitor = await _repo.GetCompetitorByIdAsync(
            request.CompetitorId, _currentUser.TenantId, ct)
            ?? throw new NotFoundException("COMPETITOR_NOT_FOUND",
                $"Competitor {request.CompetitorId} not found.");

        competitor.SoftDelete();
        await _repo.SaveChangesAsync(ct);
    }
}
