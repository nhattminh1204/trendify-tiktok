using FluentValidation;
using MediatR;
using Trendify.Modules.Trends.Domain;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Trends.Application.Commands;

public sealed record AddToWatchlistCommand(Guid TrendDetectionId) : IRequest;

public sealed class AddToWatchlistCommandValidator : AbstractValidator<AddToWatchlistCommand>
{
    public AddToWatchlistCommandValidator()
    {
        RuleFor(x => x.TrendDetectionId).NotEmpty();
    }
}

public sealed class AddToWatchlistCommandHandler : IRequestHandler<AddToWatchlistCommand>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public AddToWatchlistCommandHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(AddToWatchlistCommand request, CancellationToken ct)
    {
        var trend = await _repo.GetByIdAsync(request.TrendDetectionId, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.TrendNotFound, $"Trend {request.TrendDetectionId} not found.");

        var alreadyWatched = await _repo.IsTrendWatchedAsync(_currentUser.TenantId, request.TrendDetectionId, ct);
        if (alreadyWatched)
            throw new DomainException(ErrorCodes.TrendAlreadyWatched, "Trend is already in watchlist.");

        var item = TrendWatchlist.Create(_currentUser.TenantId, request.TrendDetectionId);
        await _repo.AddToWatchlistAsync(item, ct);
        await _repo.SaveChangesAsync(ct);
    }
}
