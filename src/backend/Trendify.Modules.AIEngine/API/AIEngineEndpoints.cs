using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.AIEngine.Application.Queries;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Responses;

namespace Trendify.Modules.AIEngine.API;

public sealed class AIEngineEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/ai").RequireAuthorization();

        grp.MapPost("/complete", Complete)
            .WithName("AIComplete")
            .WithTags("AI Engine");

        grp.MapGet("/budget", GetBudget)
            .WithName("GetAIBudget")
            .WithTags("AI Engine");

        grp.MapGet("/usage", GetUsage)
            .WithName("GetAIUsage")
            .WithTags("AI Engine");
    }

    private static async Task<IResult> Complete(
        CompleteRequest body,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(body, ct);
        return Results.Ok(ApiResponse<AICompleteDto>.Ok(result));
    }

    private static async Task<IResult> GetBudget(
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetAIBudgetQuery(), ct);
        return Results.Ok(ApiResponse<AIBudgetDto>.Ok(result));
    }

    private static async Task<IResult> GetUsage(
        int? limit,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetAIUsageQuery(limit ?? 50), ct);
        return Results.Ok(ApiResponse<List<AIUsageDto>>.Ok(result));
    }
}
