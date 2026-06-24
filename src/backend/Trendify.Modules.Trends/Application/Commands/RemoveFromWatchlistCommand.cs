using MediatR;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Trends.Application.Commands;

public sealed record RemoveFromWatchlistCommand(Guid TrendDetectionId) : IRequest;

public sealed class RemoveFromWatchlistCommandHandler : IRequestHandler<RemoveFromWatchlistCommand>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public RemoveFromWatchlistCommandHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(RemoveFromWatchlistCommand request, CancellationToken ct)
    {
        var item = await _repo.GetWatchlistItemAsync(_currentUser.TenantId, request.TrendDetectionId, ct)
            ?? throw new NotFoundException(ErrorCodes.TrendNotWatched, $"Trend {request.TrendDetectionId} is not in watchlist.");

        _repo.RemoveFromWatchlist(item);
        await _repo.SaveChangesAsync(ct);
    }
}
