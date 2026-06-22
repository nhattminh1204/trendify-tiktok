using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Audience.Application.Queries;
using Trendify.Shared.Responses;

namespace Trendify.Modules.Audience.API;

public sealed class AudienceEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/api/v1/audience").RequireAuthorization();

        grp.MapGet("/{socialAccountId:guid}", GetAudience)
            .WithName("GetAudience")
            .WithTags("Audience");
    }

    private static async Task<IResult> GetAudience(
        Guid socialAccountId,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetAudienceQuery(socialAccountId), ct);
        return Results.Ok(ApiResponse<AudienceDto>.Ok(result));
    }
}
