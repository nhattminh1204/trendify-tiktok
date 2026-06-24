using FluentValidation;
using MediatR;
using Trendify.Modules.Products.Application.Queries;
using Trendify.Modules.Products.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Products.Application.Commands;

public sealed record UpdateProductCommand(
    Guid Id,
    string? Name = null,
    decimal? Price = null,
    decimal? CommissionRate = null,
    string? Category = null,
    string? Brand = null,
    string? Description = null,
    string? ProductType = null
) : IRequest<ProductDetailDto>;

public sealed class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).MaximumLength(500).When(x => x.Name != null);
        RuleFor(x => x.Price).GreaterThan(0).When(x => x.Price.HasValue);
        RuleFor(x => x.CommissionRate).InclusiveBetween(0, 100).When(x => x.CommissionRate.HasValue);
    }
}

public sealed class UpdateProductHandler : IRequestHandler<UpdateProductCommand, ProductDetailDto>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public UpdateProductHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<ProductDetailDto> Handle(UpdateProductCommand cmd, CancellationToken ct)
    {
        var product = await _repo.GetByIdAsync(cmd.Id, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.ProductNotFound, $"Product {cmd.Id} not found.");

        product.Update(
            name: cmd.Name,
            price: cmd.Price,
            commissionRate: cmd.CommissionRate,
            category: cmd.Category,
            brand: cmd.Brand,
            description: cmd.Description,
            productType: cmd.ProductType
        );

        await _repo.SaveChangesAsync(ct);

        return new ProductDetailDto(
            product.Id, product.Name, product.Category, product.Brand,
            product.Description, product.ThumbnailUrl, product.Price,
            product.Currency, product.CommissionRate, product.CommissionAmount,
            product.Score, product.Status, product.AffiliateLink,
            product.Source, product.SyncedAt, product.CreatedAt
        );
    }
}
