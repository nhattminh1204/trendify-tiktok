using FluentValidation;
using MediatR;
using Trendify.Modules.Products.Application.Queries;
using Trendify.Modules.Products.Domain;
using Trendify.Modules.Products.Events;
using Trendify.Modules.Products.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Products.Application.Commands;

public sealed record ImportProductCommand(
    string Name,
    decimal Price,
    decimal CommissionRate,
    string AffiliateLink,
    string? Category = null,
    string? Brand = null,
    string? Description = null,
    string? ProductType = null
) : IRequest<ProductSummaryDto>;

public sealed class ImportProductValidator : AbstractValidator<ImportProductCommand>
{
    public ImportProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.CommissionRate).InclusiveBetween(0, 100);
        RuleFor(x => x.AffiliateLink).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Category).MaximumLength(200).When(x => x.Category != null);
        RuleFor(x => x.Brand).MaximumLength(200).When(x => x.Brand != null);
        RuleFor(x => x.Description).MaximumLength(5000).When(x => x.Description != null);
        RuleFor(x => x.ProductType).MaximumLength(50).When(x => x.ProductType != null);
    }
}

public sealed class ImportProductHandler : IRequestHandler<ImportProductCommand, ProductSummaryDto>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public ImportProductHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<ProductSummaryDto> Handle(ImportProductCommand cmd, CancellationToken ct)
    {
        var exists = await _repo.ExistsByAffiliateLinkAsync(
            _currentUser.TenantId, cmd.AffiliateLink, ct);
        if (exists)
            throw new ConflictException(ErrorCodes.ProductAlreadyExists,
                "A product with this affiliate link already exists.");

        var product = Product.Import(
            tenantId: _currentUser.TenantId,
            name: cmd.Name,
            price: cmd.Price,
            commissionRate: cmd.CommissionRate,
            affiliateLink: cmd.AffiliateLink,
            category: cmd.Category,
            brand: cmd.Brand,
            description: cmd.Description,
            productType: cmd.ProductType
        );

        await _repo.AddAsync(product, ct);
        await _repo.SaveChangesAsync(ct);

        return new ProductSummaryDto(
            product.Id, product.Name, product.Category, product.ThumbnailUrl,
            product.Price, product.CommissionRate, product.CommissionAmount,
            product.Score, product.Status, product.AffiliateLink
        );
    }
}
