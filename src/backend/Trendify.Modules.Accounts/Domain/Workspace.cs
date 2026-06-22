using Trendify.Shared.Domain;

namespace Trendify.Modules.Accounts.Domain;

public sealed class Workspace : TenantEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string Plan { get; private set; } = "free";

    private Workspace() { }

    public static Workspace Create(string name, string slug)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);

        var workspace = new Workspace
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Slug = slug.Trim().ToLowerInvariant()
        };

        // In Phase 1, the workspace IS the tenant
        workspace.TenantId = workspace.Id;

        return workspace;
    }

    public void UpdatePlan(string plan)
    {
        Plan = plan;
        MarkUpdated();
    }
}
