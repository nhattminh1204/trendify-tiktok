using FluentValidation;
using MediatR;
using Trendify.Modules.Products.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Products.Application.Commands;

public sealed record AddToWatchlistCommand(Guid ProductId, string? Notes = null) : IRequest;

public sealed class AddToWatchlistValidator : AbstractValidator<AddToWatchlistCommand>
{
    public AddToWatchlistValidator() =>
        RuleFor(x => x.ProductId).NotEmpty();
}

public sealed record RemoveFromWatchlistCommand(Guid ProductId) : IRequest;

public sealed class AddToWatchlistHandler : IRequestHandler<AddToWatchlistCommand>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public AddToWatchlistHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(AddToWatchlistCommand cmd, CancellationToken ct)
    {
        var product = await _repo.GetByIdAsync(cmd.ProductId, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.ProductNotFound, $"Product {cmd.ProductId} not found.");

        var alreadyIn = await _repo.IsInWatchlistAsync(_currentUser.TenantId, cmd.ProductId, ct);
        if (alreadyIn)
            throw new ConflictException(ErrorCodes.ProductAlreadyInWatchlist,
                "Product is already in your watchlist.");

        var item = Domain.ProductWatchlist.Add(_currentUser.TenantId, cmd.ProductId, cmd.Notes);
        await _repo.AddToWatchlistAsync(item, ct);
        await _repo.SaveChangesAsync(ct);
    }
}

public sealed class RemoveFromWatchlistHandler : IRequestHandler<RemoveFromWatchlistCommand>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public RemoveFromWatchlistHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(RemoveFromWatchlistCommand cmd, CancellationToken ct)
    {
        var item = await _repo.GetWatchlistItemAsync(_currentUser.TenantId, cmd.ProductId, ct)
            ?? throw new NotFoundException(ErrorCodes.ProductNotInWatchlist,
                "Product is not in your watchlist.");

        await _repo.RemoveFromWatchlistAsync(item, ct);
        await _repo.SaveChangesAsync(ct);
    }
}
