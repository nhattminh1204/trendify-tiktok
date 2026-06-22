using Trendify.Shared.Domain;

namespace Trendify.Modules.AIEngine.Domain;

public sealed class AIPrompt : TenantEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Template { get; private set; } = string.Empty;

    // micro | standard | premium
    public string Tier { get; private set; } = "standard";
    public string FeatureContext { get; private set; } = string.Empty;

    // Semantic version: 1, 2, 3 ...
    public int Version { get; private set; } = 1;
    public bool IsActive { get; private set; } = true;

    // JSONB: {"key": "description", ...}
    public Dictionary<string, string> Variables { get; private set; } = new();

    private AIPrompt() { }

    public static AIPrompt Create(
        Guid tenantId,
        string slug,
        string name,
        string template,
        string tier,
        string featureContext,
        string? description = null)
    {
        return new AIPrompt
        {
            TenantId = tenantId,
            Slug = slug.ToLowerInvariant().Replace(' ', '-'),
            Name = name,
            Template = template,
            Tier = tier,
            FeatureContext = featureContext,
            Description = description ?? string.Empty
        };
    }

    public AIPrompt NewVersion(string newTemplate, Dictionary<string, string>? variables = null)
    {
        return new AIPrompt
        {
            TenantId = TenantId,
            Slug = Slug,
            Name = Name,
            Description = Description,
            Template = newTemplate,
            Tier = Tier,
            FeatureContext = FeatureContext,
            Version = Version + 1,
            Variables = variables ?? Variables,
            IsActive = true
        };
    }

    public string Render(Dictionary<string, string> values)
    {
        var result = Template;
        foreach (var (key, value) in values)
            result = result.Replace($"{{{{{key}}}}}", value);
        return result;
    }

    public void Deactivate() => IsActive = false;
}
