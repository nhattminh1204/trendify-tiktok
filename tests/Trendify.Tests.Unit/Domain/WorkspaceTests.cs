using FluentAssertions;
using Trendify.Modules.Accounts.Domain;
using Xunit;

namespace Trendify.Tests.Unit.Domain;

public sealed class WorkspaceTests
{
    [Fact]
    public void Create_ShouldSetSlugAndTenantId()
    {
        var workspace = Workspace.Create("My Brand", "my-brand");

        workspace.Name.Should().Be("My Brand");
        workspace.Slug.Should().Contain("my-brand");
        workspace.Id.Should().NotBeEmpty();
        // Phase 1: TenantId == workspace.Id (single-tenant workspace)
        workspace.TenantId.Should().Be(workspace.Id);
    }

    [Fact]
    public void Create_ShouldNormalizePlanToFree()
    {
        var workspace = Workspace.Create("Test", "test");
        workspace.Plan.Should().Be("free");
    }

    [Theory]
    [InlineData("pro")]
    [InlineData("agency")]
    public void UpdatePlan_ShouldChangePlan(string newPlan)
    {
        var workspace = Workspace.Create("Test", "test");
        workspace.UpdatePlan(newPlan);
        workspace.Plan.Should().Be(newPlan);
    }
}
