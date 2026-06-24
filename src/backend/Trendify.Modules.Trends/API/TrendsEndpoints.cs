using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Trends.Application.Commands;
using Trendify.Modules.Trends.Application.Queries;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Trends.API;

public sealed class TrendsEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/trends").RequireAuthorization();

        // Trends
        grp.MapGet("/", GetTrends)
            .WithName("GetTrends")
            .WithTags("Trends");

        grp.MapGet("/{id:guid}", GetTrend)
            .WithName("GetTrend")
            .WithTags("Trends");

        // Watchlist
        grp.MapGet("/watchlist", GetWatchlist)
            .WithName("GetWatchlist")
            .WithTags("Trends Watchlist");

        grp.MapPost("/{id:guid}/watch", AddToWatchlist)
            .WithName("AddToWatchlist")
            .WithTags("Trends Watchlist");

        grp.MapDelete("/{id:guid}/watch", RemoveFromWatchlist)
            .WithName("RemoveFromWatchlist")
            .WithTags("Trends Watchlist");

        grp.MapPatch("/{id:guid}/watch/notes", UpdateWatchlistNote)
            .WithName("UpdateWatchlistNote")
            .WithTags("Trends Watchlist");

        // Competitors
        grp.MapGet("/competitors", GetCompetitors)
            .WithName("GetCompetitors")
            .WithTags("Trends Competitors");

        grp.MapPost("/competitors", AddCompetitor)
            .WithName("AddCompetitor")
            .WithTags("Trends Competitors");

        grp.MapDelete("/competitors/{id:guid}", RemoveCompetitor)
            .WithName("RemoveCompetitor")
            .WithTags("Trends Competitors");
    }

    // Trends

    private static async Task<IResult> GetTrends(
        IMediator mediator,
        string? niche = null,
        int limit = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetTrendsQuery(niche, limit), ct);
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

    // Watchlist

    private static async Task<IResult> GetWatchlist(
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetWatchlistQuery(), ct);
        return Results.Ok(ApiResponse<List<WatchlistItemDto>>.Ok(result));
    }

    private static async Task<IResult> AddToWatchlist(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new AddToWatchlistCommand(id), ct);
        return Results.Ok(ApiResponse<string>.Ok("Trend added to watchlist."));
    }

    private static async Task<IResult> RemoveFromWatchlist(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new RemoveFromWatchlistCommand(id), ct);
        return Results.Ok(ApiResponse<string>.Ok("Trend removed from watchlist."));
    }

    private static async Task<IResult> UpdateWatchlistNote(
        Guid id,
        UpdateNoteRequest body,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new UpdateWatchlistNoteCommand(id, body.Notes), ct);
        return Results.Ok(ApiResponse<string>.Ok("Note updated."));
    }

    // Competitors

    private static async Task<IResult> GetCompetitors(
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetCompetitorsQuery(), ct);
        return Results.Ok(ApiResponse<List<CompetitorDto>>.Ok(result));
    }

    private static async Task<IResult> AddCompetitor(
        AddCompetitorRequest body,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new AddCompetitorCommand(body.TikTokUsername, body.Notes), ct);
        return Results.Ok(ApiResponse<string>.Ok("Competitor added."));
    }

    private static async Task<IResult> RemoveCompetitor(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new RemoveCompetitorCommand(id), ct);
        return Results.Ok(ApiResponse<string>.Ok("Competitor removed."));
    }

    private sealed record UpdateNoteRequest(string? Notes);
    private sealed record AddCompetitorRequest(string TikTokUsername, string? Notes);
}
