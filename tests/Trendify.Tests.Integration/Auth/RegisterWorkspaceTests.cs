using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Trendify.Tests.Integration.Fixtures;
using Xunit;

namespace Trendify.Tests.Integration.Auth;

public sealed class RegisterWorkspaceTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public RegisterWorkspaceTests(IntegrationTestFixture fixture)
    {
        _client = fixture.Client;
    }

    [Fact]
    public async Task POST_Register_WithValidData_Returns200WithTokens()
    {
        var payload = new
        {
            workspaceName = "Integration Test Workspace",
            email = $"test+{Guid.NewGuid():N}@example.com",
            password = "Test1234!",
            niche = "fitness"
        };

        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<RegisterResponse>();
        body!.Data.AccessToken.Should().NotBeNullOrEmpty();
        body.Data.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task POST_Register_WithDuplicateEmail_Returns409()
    {
        var email = $"duplicate+{Guid.NewGuid():N}@example.com";
        var payload = new
        {
            workspaceName = "First Workspace",
            email,
            password = "Test1234!"
        };

        await _client.PostAsJsonAsync("/api/v1/auth/register", payload);
        var secondResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", payload);

        secondResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    private sealed record RegisterResponse(RegisterData Data);
    private sealed record RegisterData(string AccessToken, string RefreshToken);
}
