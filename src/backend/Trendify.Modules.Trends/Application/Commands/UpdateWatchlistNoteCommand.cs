using MediatR;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Trends.Application.Commands;

public sealed record UpdateWatchlistNoteCommand(Guid TrendDetectionId, string? Notes) : IRequest;

public sealed class UpdateWatchlistNoteCommandHandler : IRequestHandler<UpdateWatchlistNoteCommand>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public UpdateWatchlistNoteCommandHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateWatchlistNoteCommand request, CancellationToken ct)
    {
        var item = await _repo.GetWatchlistItemAsync(_currentUser.TenantId, request.TrendDetectionId, ct)
            ?? throw new NotFoundException(ErrorCodes.TrendNotWatched, $"Trend {request.TrendDetectionId} is not in watchlist.");

        item.UpdateNotes(request.Notes);
        await _repo.SaveChangesAsync(ct);
    }
}
