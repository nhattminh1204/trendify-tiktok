using MediatR;
using Trendify.Modules.Products.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Products.Application.Commands;

public sealed record DeleteProductCommand(Guid Id) : IRequest;

public sealed class DeleteProductHandler : IRequestHandler<DeleteProductCommand>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public DeleteProductHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteProductCommand cmd, CancellationToken ct)
    {
        var product = await _repo.GetByIdAsync(cmd.Id, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.ProductNotFound, $"Product {cmd.Id} not found.");

        product.Archive();
        await _repo.SaveChangesAsync(ct);
    }
}
