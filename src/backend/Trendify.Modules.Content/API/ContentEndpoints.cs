using Carter;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Content.Application.Commands;
using Trendify.Modules.Content.Application.Commands.GenerateIdeas;
using Trendify.Modules.Content.Application.Commands.GenerateHook;
using Trendify.Modules.Content.Application.Queries;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Content.API;

public sealed class ContentEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/content").RequireAuthorization();

        grp.MapGet("/ideas", GetIdeas)
            .WithName("GetContentIdeas")
            .WithTags("Content");

        grp.MapPost("/ideas", CreateIdea)
            .WithName("CreateContentIdea")
            .WithTags("Content");

        grp.MapPatch("/ideas/{id:guid}/approve", ApproveIdea)
            .WithName("ApproveContentIdea")
            .WithTags("Content");

        grp.MapPatch("/ideas/{id:guid}/publish", PublishIdea)
            .WithName("PublishContentIdea")
            .WithTags("Content");

        // AI generation
        grp.MapPost("/ideas/generate", GenerateIdeas)
            .WithName("GenerateContentIdeas")
            .WithTags("Content");

        grp.MapPost("/ideas/{id:guid}/generate-hook", GenerateHook)
            .WithName("GenerateHook")
            .WithTags("Content");
    }

    private static async Task<IResult> GetIdeas(
        string? status,
        int? limit,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetIdeasQuery(status, limit ?? 20), ct);
        return Results.Ok(ApiResponse<List<IdeaDto>>.Ok(result));
    }

    private static async Task<IResult> CreateIdea(
        CreateIdeaCommand body,
        IMediator mediator,
        IValidator<CreateIdeaCommand> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(body, ct);
        if (!validation.IsValid)
            return Results.BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR",
                string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))));

        var result = await mediator.Send(body, ct);
        return Results.Created($"/api/v1/content/ideas/{result.Id}",
            ApiResponse<IdeaDto>.Ok(result));
    }

    private static async Task<IResult> ApproveIdea(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new ApproveIdeaCommand(id), ct);
        return Results.NoContent();
    }

    private static async Task<IResult> PublishIdea(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        await mediator.Send(new PublishIdeaCommand(id), ct);
        return Results.NoContent();
    }

    private static async Task<IResult> GenerateIdeas(
        GenerateContentIdeasCommand body,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(body, ct);
        return Results.Ok(ApiResponse<List<IdeaDto>>.Ok(result));
    }

    private static async Task<IResult> GenerateHook(
        Guid id,
        IMediator mediator,
        CancellationToken ct)
    {
        var hook = await mediator.Send(new GenerateHookCommand(id), ct);
        return Results.Ok(ApiResponse<string>.Ok(hook));
    }
}
