using FluentAssertions;
using Trendify.Modules.Content.Domain;
using Trendify.Shared.Errors;
using Xunit;

namespace Trendify.Tests.Unit.Domain;

public sealed class ContentIdeaTests
{
    private static readonly Guid TenantId = Guid.NewGuid();
    private static readonly Guid UserId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldStartAsDraft()
    {
        var idea = ContentIdea.Create(TenantId, UserId, "15s morning routine");
        idea.Status.Should().Be("draft");
    }

    [Fact]
    public void Approve_FromDraft_ShouldSucceed()
    {
        var idea = ContentIdea.Create(TenantId, UserId, "Hook video");
        idea.Approve();
        idea.Status.Should().Be("approved");
    }

    [Fact]
    public void Approve_FromApproved_ShouldThrow()
    {
        var idea = ContentIdea.Create(TenantId, UserId, "Hook video");
        idea.Approve();

        var act = () => idea.Approve();
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void FullLifecycle_ShouldReachPublished()
    {
        var idea = ContentIdea.Create(TenantId, UserId, "Full flow idea");
        idea.Approve();
        idea.MarkInProduction();
        idea.MarkPublished();

        idea.Status.Should().Be("published");
    }
}
