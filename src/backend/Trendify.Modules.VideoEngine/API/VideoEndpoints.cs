using Carter;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.VideoEngine.Application.Commands;
using Trendify.Modules.VideoEngine.Application.Queries;
using Trendify.Shared.Responses;

namespace Trendify.Modules.VideoEngine.API;

public sealed class VideoEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/video-engine").RequireAuthorization();

        grp.MapGet("/jobs", GetJobs)
            .WithName("GetRenderJobs")
            .WithTags("Video Engine");

        grp.MapGet("/jobs/{id:guid}", GetJobDetail)
            .WithName("GetRenderJobDetail")
            .WithTags("Video Engine");

        grp.MapPost("/jobs", CreateJob)
            .WithName("CreateRenderJob")
            .WithTags("Video Engine");

        grp.MapPost("/jobs/{id:guid}/cancel", CancelJob)
            .WithName("CancelRenderJob")
            .WithTags("Video Engine");

        grp.MapGet("/templates", GetTemplates)
            .WithName("GetVideoTemplates")
            .WithTags("Video Engine");
    }

    private static async Task<IResult> CreateJob(
        CreateRenderJobCommand body,
        IMediator mediator,
        IValidator<CreateRenderJobCommand> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(body, ct);
        if (!validation.IsValid)
            return Results.BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR",
                string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))));

        var id = await mediator.Send(body, ct);
        return Results.Created($"/api/v1/video-engine/jobs/{id}",
            ApiResponse<Guid>.Ok(id));
    }

    private static async Task<IResult> GetJobs(
        IMediator mediator,
        Guid? campaignId = null,
        string? status = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(
            new GetRenderJobsQuery(campaignId, status, page, pageSize), ct);
        return Results.Ok(ApiResponse<PagedResult<RenderJobSummaryDto>>.Ok(result));
    }

    private static async Task<IResult> GetJobDetail(
        Guid id, IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetRenderJobDetailQuery(id), ct);
        if (result is null)
            return Results.NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Render job not found."));
        return Results.Ok(ApiResponse<RenderJobDetailDto>.Ok(result));
    }

    private static async Task<IResult> CancelJob(
        Guid id, IMediator mediator, CancellationToken ct)
    {
        await mediator.Send(new CancelRenderJobCommand(id), ct);
        return Results.Ok(ApiResponse<string>.Ok("Render job cancelled."));
    }

    private static async Task<IResult> GetTemplates(
        IMediator mediator, CancellationToken ct)
    {
        var result = await mediator.Send(new GetTemplatesQuery(), ct);
        return Results.Ok(ApiResponse<List<TemplateDto>>.Ok(result));
    }
}
