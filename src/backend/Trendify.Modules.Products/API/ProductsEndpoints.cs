using Carter;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Products.Application.Commands;
using Trendify.Modules.Products.Application.Queries;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Products.API;

public sealed class ProductsEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/products").RequireAuthorization();

        // Product CRUD
        grp.MapGet("/", GetProducts)
            .WithName("GetProducts")
            .WithTags("Products");

        grp.MapGet("/{id:guid}", GetProduct)
            .WithName("GetProductDetail")
            .WithTags("Products");

        grp.MapPost("/import", ImportProduct)
            .WithName("ImportProduct")
            .WithTags("Products");

        grp.MapPut("/{id:guid}", UpdateProduct)
            .WithName("UpdateProduct")
            .WithTags("Products");

        grp.MapDelete("/{id:guid}", DeleteProduct)
            .WithName("DeleteProduct")
            .WithTags("Products");

        // Watchlist
        grp.MapGet("/watchlist", GetWatchlist)
            .WithName("GetProductsWatchlist")
            .WithTags("Products");

        grp.MapPost("/watchlist", AddToWatchlist)
            .WithName("AddProductToWatchlist")
            .WithTags("Products");

        grp.MapDelete("/watchlist/{productId:guid}", RemoveFromWatchlist)
            .WithName("RemoveProductFromWatchlist")
            .WithTags("Products");

        // Metrics
        grp.MapGet("/{id:guid}/metrics", GetProductMetrics)
            .WithName("GetProductMetrics")
            .WithTags("Products");
    }

    private static async Task<IResult> GetProducts(
        string? sort,
        string? category,
        decimal? minScore,
        string? status,
        int? page,
        int? pageSize,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(
            new GetProductsQuery(sort, category, minScore, status, page ?? 1, pageSize ?? 20), ct);
        return Results.Ok(ApiResponse<PagedResult<ProductSummaryDto>>.Ok(result));
    }

    private static async Task<IResult> GetProduct(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductDetailQuery(id), ct);
        return Results.Ok(ApiResponse<ProductDetailDto>.Ok(result));
    }

    private static async Task<IResult> ImportProduct(
        ImportProductCommand body,
        IValidator<ImportProductCommand> validator,
        IMediator mediator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(body, ct);
        if (!validation.IsValid)
            return Results.BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR",
                string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))));

        var result = await mediator.Send(body, ct);
        return Results.Created($"/api/v1/products/{result.Id}",
            ApiResponse<ProductSummaryDto>.Ok(result));
    }

    private static async Task<IResult> UpdateProduct(
        Guid id,
        UpdateProductCommand body,
        IValidator<UpdateProductCommand> validator,
        IMediator mediator,
        CancellationToken ct)
    {
        if (id != body.Id)
            return Results.BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR",
                "Route ID does not match body ID."));

        var validation = await validator.ValidateAsync(body, ct);
        if (!validation.IsValid)
            return Results.BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR",
                string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))));

        var result = await mediator.Send(body, ct);
        return Results.Ok(ApiResponse<ProductDetailDto>.Ok(result));
    }

    private static async Task<IResult> DeleteProduct(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new DeleteProductCommand(id), ct);
        return Results.NoContent();
    }

    private static async Task<IResult> GetWatchlist(
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetWatchlistQuery(), ct);
        return Results.Ok(ApiResponse<List<WatchlistItemDto>>.Ok(result));
    }

    private static async Task<IResult> AddToWatchlist(
        AddToWatchlistCommand body,
        IValidator<AddToWatchlistCommand> validator,
        IMediator mediator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(body, ct);
        if (!validation.IsValid)
            return Results.BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR",
                string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))));

        await mediator.Send(body, ct);
        return Results.NoContent();
    }

    private static async Task<IResult> RemoveFromWatchlist(
        Guid productId,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new RemoveFromWatchlistCommand(productId), ct);
        return Results.NoContent();
    }

    private static async Task<IResult> GetProductMetrics(
        Guid id,
        string? period,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(
            new GetProductMetricsQuery(id, period ?? "30d"), ct);
        return Results.Ok(ApiResponse<ProductMetricsDto>.Ok(result));
    }
}
