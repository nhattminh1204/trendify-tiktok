using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Analytics.Application.Queries;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Analytics.API;

public sealed class AnalyticsEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/analytics").RequireAuthorization();

        grp.MapGet("/posts/{postId:guid}", GetPostMetrics)
            .WithName("GetPostMetrics")
            .WithTags("Analytics");
    }

    private static async Task<IResult> GetPostMetrics(
        Guid postId,
        int? limit,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetAnalyticsQuery(postId, limit ?? 30), ct);
        return Results.Ok(ApiResponse<List<MetricsDto>>.Ok(result));
    }
}
