using Trendify.Shared.Domain;

namespace Trendify.Modules.Content.Domain;

public sealed class ContentIdea : TenantEntity
{
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Hook { get; private set; }
    public string? Script { get; private set; }
    public string? Cta { get; private set; }
    public string? Niche { get; private set; }
    public Guid? TargetPersonaId { get; private set; }
    public Guid? TrendId { get; private set; }

    // draft | approved | ready | in_production | published | archived
    public string Status { get; private set; } = "draft";

    public bool GeneratedByAI { get; private set; }
    public Guid CreatedByUserId { get; private set; }

    private ContentIdea() { }

    public static ContentIdea Create(
        Guid tenantId,
        Guid createdByUserId,
        string title,
        string? description = null,
        Guid? trendId = null,
        Guid? personaId = null,
        bool generatedByAI = false,
        string? niche = null)
    {
        return new ContentIdea
        {
            TenantId = tenantId,
            CreatedByUserId = createdByUserId,
            Title = title.Trim(),
            Description = description?.Trim(),
            TrendId = trendId,
            TargetPersonaId = personaId,
            GeneratedByAI = generatedByAI,
            Niche = niche
        };
    }

    public void SetHook(string hook)
    {
        Hook = hook.Trim();
        MarkUpdated();
    }

    public void SetScript(string script)
    {
        Script = script.Trim();
        MarkUpdated();
    }

    public void SetCta(string cta)
    {
        Cta = cta.Trim();
        MarkUpdated();
    }

    public void Approve()
    {
        if (Status != "draft")
            throw new InvalidOperationException("Only draft ideas can be approved.");
        Status = "approved";
        MarkUpdated();
    }

    public void MarkReady()
    {
        if (Status != "approved")
            throw new InvalidOperationException("Only approved ideas can be marked ready.");
        Status = "ready";
        MarkUpdated();
    }

    public void MarkInProduction()
    {
        if (Status != "ready")
            throw new InvalidOperationException("Only ready ideas can be moved to production.");
        Status = "in_production";
        MarkUpdated();
    }

    public void MarkPublished()
    {
        Status = "published";
        MarkUpdated();
    }

    public void Archive()
    {
        Status = "archived";
        MarkUpdated();
    }
}
