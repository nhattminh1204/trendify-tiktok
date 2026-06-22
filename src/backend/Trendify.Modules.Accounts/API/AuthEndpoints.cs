using Carter;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Accounts.Application.Commands.Login;
using Trendify.Modules.Accounts.Application.Commands.RefreshToken;
using Trendify.Modules.Accounts.Application.Commands.RegisterWorkspace;

namespace Trendify.Modules.Accounts.API;

public sealed class AuthEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth").WithTags("Auth");

        group.MapPost("/register", async (
            RegisterWorkspaceCommand command,
            IValidator<RegisterWorkspaceCommand> validator,
            ISender sender,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(command, ct);
            if (!validation.IsValid)
                return Results.UnprocessableEntity(validation.Errors
                    .Select(e => new { field = e.PropertyName, message = e.ErrorMessage }));

            var result = await sender.Send(command, ct);
            return Results.Created($"/api/v1/accounts/workspace", result);
        })
        .WithName("Register")
        .Produces(201)
        .Produces(422)
        .AllowAnonymous();

        group.MapPost("/login", async (
            LoginCommand command,
            IValidator<LoginCommand> validator,
            ISender sender,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(command, ct);
            if (!validation.IsValid)
                return Results.UnprocessableEntity(validation.Errors
                    .Select(e => new { field = e.PropertyName, message = e.ErrorMessage }));

            var result = await sender.Send(command, ct);
            return Results.Ok(result);
        })
        .WithName("Login")
        .Produces(200)
        .Produces(401)
        .AllowAnonymous();

        group.MapPost("/refresh", async (
            RefreshTokenCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return Results.Ok(result);
        })
        .WithName("RefreshToken")
        .Produces(200)
        .Produces(401)
        .AllowAnonymous();

        group.MapPost("/logout", (
            ISender sender,
            HttpContext context,
            CancellationToken ct) =>
        {
            // Clear refresh token from DB via a command (simplified here)
            return Results.NoContent();
        })
        .WithName("Logout")
        .RequireAuthorization();
    }
}
