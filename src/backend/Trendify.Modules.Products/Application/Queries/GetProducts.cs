using MediatR;
using Trendify.Modules.Products.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Products.Application.Queries;

public sealed record GetProductsQuery(
    string? Sort = null,
    string? Category = null,
    decimal? MinScore = null,
    string? Status = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<ProductSummaryDto>>;

public sealed record GetProductDetailQuery(Guid Id) : IRequest<ProductDetailDto>;

public sealed record GetWatchlistQuery : IRequest<List<WatchlistItemDto>>;

public sealed record GetProductMetricsQuery(Guid ProductId, string Period = "30d") : IRequest<ProductMetricsDto>;

public sealed record ProductSummaryDto(
    Guid Id,
    string Name,
    string? Category,
    string? ThumbnailUrl,
    decimal Price,
    decimal CommissionRate,
    decimal CommissionAmount,
    decimal Score,
    string Status,
    string? AffiliateLink
);

public sealed record ProductDetailDto(
    Guid Id,
    string Name,
    string? Category,
    string? Brand,
    string? Description,
    string? ThumbnailUrl,
    decimal Price,
    string Currency,
    decimal CommissionRate,
    decimal CommissionAmount,
    decimal Score,
    string Status,
    string? AffiliateLink,
    string Source,
    DateTimeOffset? SyncedAt,
    DateTimeOffset CreatedAt
);

public sealed record WatchlistItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ProductCategory,
    string? ThumbnailUrl,
    decimal Price,
    decimal CommissionRate,
    decimal Score,
    string? Notes,
    DateTimeOffset AddedAt
);

public sealed record ProductMetricsDto(
    Guid ProductId,
    string Period,
    long TotalViews,
    long TotalClicks,
    int TotalOrders,
    decimal TotalRevenue,
    decimal TotalCommissionEarned,
    decimal Ctr,
    decimal Cvr,
    List<ProductMetricsDailyDto> Daily
);

public sealed record ProductMetricsDailyDto(
    DateOnly Date,
    long Views,
    long Clicks,
    int Orders,
    decimal CommissionEarned
);

public sealed class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductSummaryDto>>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetProductsQueryHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<ProductSummaryDto>> Handle(GetProductsQuery q, CancellationToken ct)
    {
        var items = await _repo.GetListAsync(
            _currentUser.TenantId, q.Sort, q.Category, q.MinScore, q.Status,
            q.Page, q.PageSize, ct);
        var total = await _repo.GetCountAsync(
            _currentUser.TenantId, q.Category, q.MinScore, q.Status, ct);

        var dtoItems = items.Select(p => new ProductSummaryDto(
            p.Id, p.Name, p.Category, p.ThumbnailUrl,
            p.Price, p.CommissionRate, p.CommissionAmount,
            p.Score, p.Status, p.AffiliateLink
        )).ToList();

        var hasMore = total > q.Page * q.PageSize;
        var cursor = hasMore ? (q.Page + 1).ToString() : null;

        return new PagedResult<ProductSummaryDto>(dtoItems, cursor, hasMore, total);
    }
}

public sealed class GetProductDetailQueryHandler
    : IRequestHandler<GetProductDetailQuery, ProductDetailDto>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetProductDetailQueryHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<ProductDetailDto> Handle(GetProductDetailQuery q, CancellationToken ct)
    {
        var product = await _repo.GetByIdAsync(q.Id, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.ProductNotFound, $"Product {q.Id} not found.");

        return new ProductDetailDto(
            product.Id, product.Name, product.Category, product.Brand,
            product.Description, product.ThumbnailUrl, product.Price,
            product.Currency, product.CommissionRate, product.CommissionAmount,
            product.Score, product.Status, product.AffiliateLink,
            product.Source, product.SyncedAt, product.CreatedAt
        );
    }
}

public sealed class GetWatchlistQueryHandler
    : IRequestHandler<GetWatchlistQuery, List<WatchlistItemDto>>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetWatchlistQueryHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<WatchlistItemDto>> Handle(GetWatchlistQuery q, CancellationToken ct)
    {
        var items = await _repo.GetWatchlistAsync(_currentUser.TenantId, ct);
        var result = new List<WatchlistItemDto>(items.Count);

        foreach (var item in items)
        {
            var product = await _repo.GetByIdAsync(item.ProductId, _currentUser.TenantId, ct);
            if (product is null) continue;

            result.Add(new WatchlistItemDto(
                item.Id, product.Id, product.Name, product.Category,
                product.ThumbnailUrl, product.Price, product.CommissionRate,
                product.Score, item.Notes, item.CreatedAt
            ));
        }

        return result;
    }
}

public sealed class GetProductMetricsQueryHandler
    : IRequestHandler<GetProductMetricsQuery, ProductMetricsDto>
{
    private readonly IProductsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetProductMetricsQueryHandler(IProductsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<ProductMetricsDto> Handle(GetProductMetricsQuery q, CancellationToken ct)
    {
        var days = q.Period switch
        {
            "7d" => 7,
            "90d" => 90,
            _ => 30
        };

        var metrics = await _repo.GetMetricsAsync(_currentUser.TenantId, q.ProductId, days, ct);

        return new ProductMetricsDto(
            q.ProductId, q.Period,
            metrics.Sum(m => m.Views),
            metrics.Sum(m => m.Clicks),
            metrics.Sum(m => m.Orders),
            metrics.Sum(m => m.Revenue),
            metrics.Sum(m => m.CommissionEarned),
            metrics.Any() ? metrics.Average(m => m.Ctr) : 0,
            metrics.Any() ? metrics.Average(m => m.Cvr) : 0,
            metrics.Select(m => new ProductMetricsDailyDto(
                m.PeriodDate, m.Views, m.Clicks, m.Orders, m.CommissionEarned
            )).ToList()
        );
    }
}
