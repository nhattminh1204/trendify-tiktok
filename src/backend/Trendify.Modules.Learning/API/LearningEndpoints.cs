using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Learning.Application.Commands;
using Trendify.Modules.Learning.Application.Queries;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Learning.API;

public sealed class LearningEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/learning").RequireAuthorization();

        grp.MapGet("/patterns", GetPatterns)
            .WithName("GetPatterns")
            .WithTags("Learning");

        grp.MapGet("/recommendations", GetRecommendations)
            .WithName("GetRecommendations")
            .WithTags("Learning");

        grp.MapPost("/recommendations/{id:guid}/apply", ApplyRecommendation)
            .WithName("ApplyRecommendation")
            .WithTags("Learning");
    }

    private static async Task<IResult> GetPatterns(
        string? niche,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetPatternsQuery(niche), ct);
        return Results.Ok(ApiResponse<List<PatternDto>>.Ok(result));
    }

    private static async Task<IResult> GetRecommendations(
        string? status,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetRecommendationsQuery(status ?? "pending"), ct);
        return Results.Ok(ApiResponse<List<RecommendationDto>>.Ok(result));
    }

    private static async Task<IResult> ApplyRecommendation(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new ApplyRecommendationCommand(id), ct);
        return Results.NoContent();
    }
}
