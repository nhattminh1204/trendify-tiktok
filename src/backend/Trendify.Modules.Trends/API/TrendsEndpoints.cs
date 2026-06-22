using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Trends.Application.Queries;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Trends.API;

public sealed class TrendsEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/trends").RequireAuthorization();

        grp.MapGet("/", GetTrends)
            .WithName("GetTrends")
            .WithTags("Trends");

        grp.MapGet("/{id:guid}", GetTrend)
            .WithName("GetTrend")
            .WithTags("Trends");
    }

    private static async Task<IResult> GetTrends(
        string? niche,
        int limit,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetTrendsQuery(niche, limit > 0 ? limit : 20), ct);
        return Results.Ok(ApiResponse<List<TrendDto>>.Ok(result));
    }

    private static async Task<IResult> GetTrend(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetTrendDetailQuery(id), ct);
        return Results.Ok(ApiResponse<TrendDto>.Ok(result));
    }
}
