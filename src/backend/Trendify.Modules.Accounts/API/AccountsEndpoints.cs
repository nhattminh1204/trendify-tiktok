using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Trendify.Modules.Accounts.Application.Commands.ConnectTikTok;
using Trendify.Modules.Accounts.Application.Queries.GetSocialAccounts;
using Trendify.Modules.Accounts.Infrastructure.TikTok;
using Trendify.Shared.Errors;
using Microsoft.Extensions.DependencyInjection;

namespace Trendify.Modules.Accounts.API;

public sealed class AccountsEndpoints : ICarterModule
{
    private const string SessionStateKey = "tiktok_oauth_state";
    private const string SessionVerifierKey = "tiktok_pkce_verifier";

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/accounts")
            .WithTags("Accounts")
            .RequireAuthorization();

        // Social accounts
        group.MapGet("/social", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetSocialAccountsQuery(), ct);
            return Results.Ok(result);
        })
        .WithName("GetSocialAccounts")
        .Produces(200);

        // TikTok OAuth: generate PKCE challenge, store state + verifier in session, redirect to TikTok
        group.MapGet("/social/tiktok/connect", (
            TikTokOAuthService tikTok,
            HttpContext context) =>
        {
            var state = Guid.NewGuid().ToString("N");
            var challenge = tikTok.BuildAuthorizationUrl(state);

            // Both stored server-side — never exposed to the browser
            context.Session.SetString(SessionStateKey, state);
            context.Session.SetString(SessionVerifierKey, challenge.CodeVerifier);

            return Results.Redirect(challenge.AuthUrl);
        })
        .WithName("TikTokConnectStart");

        // TikTok OAuth: handle callback — verify CSRF state, retrieve verifier, exchange code
        group.MapGet("/social/tiktok/callback", async (
            string code,
            string state,
            string redirect_uri,
            ISender sender,
            HttpContext context,
            CancellationToken ct) =>
        {
            // CSRF check
            var expectedState = context.Session.GetString(SessionStateKey);
            if (string.IsNullOrEmpty(expectedState) || expectedState != state)
                return Results.Json(
                    new { error = new { code = ErrorCodes.InvalidOAuthState, message = "Invalid or expired OAuth state." } },
                    statusCode: 400);

            // Retrieve PKCE verifier stored during connect step
            var codeVerifier = context.Session.GetString(SessionVerifierKey);
            if (string.IsNullOrEmpty(codeVerifier))
                return Results.Json(
                    new { error = new { code = ErrorCodes.InvalidOAuthState, message = "PKCE verifier not found." } },
                    statusCode: 400);

            // Clean up session values — single-use
            context.Session.Remove(SessionStateKey);
            context.Session.Remove(SessionVerifierKey);

            var result = await sender.Send(
                new ConnectTikTokCommand(code, redirect_uri, codeVerifier), ct);
            return Results.Ok(result);
        })
        .WithName("TikTokConnectCallback")
        .AllowAnonymous(); // OAuth callback — auth established after this

        group.MapDelete("/social/{id:guid}", (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            // DisconnectSocialAccountCommand
            return Results.NoContent();
        })
        .WithName("DisconnectSocialAccount");
    }
}
