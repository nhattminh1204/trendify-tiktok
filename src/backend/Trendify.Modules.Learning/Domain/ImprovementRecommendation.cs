using Trendify.Shared.Domain;

namespace Trendify.Modules.Learning.Domain;

public sealed class ImprovementRecommendation : TenantEntity
{
    public Guid? PatternId { get; private set; }

    // hook | cta | duration | posting_time | content_format
    public string Category { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Rationale { get; private set; } = string.Empty;
    public string ActionableAdvice { get; private set; } = string.Empty;

    // high | medium | low
    public string Priority { get; private set; } = "medium";

    // 0-100 confidence from AI
    public decimal Confidence { get; private set; }

    // pending | applied | dismissed
    public string Status { get; private set; } = "pending";

    public DateTimeOffset? AppliedAt { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }

    private ImprovementRecommendation() { }

    public static ImprovementRecommendation Generate(
        Guid tenantId,
        string category,
        string title,
        string rationale,
        string actionableAdvice,
        string priority,
        decimal confidence,
        Guid? patternId = null)
    {
        return new ImprovementRecommendation
        {
            TenantId = tenantId,
            PatternId = patternId,
            Category = category,
            Title = title,
            Rationale = rationale,
            ActionableAdvice = actionableAdvice,
            Priority = priority,
            Confidence = confidence,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(14)
        };
    }

    public void Apply()
    {
        Status = "applied";
        AppliedAt = DateTimeOffset.UtcNow;
        MarkUpdated();
    }

    public void Dismiss()
    {
        Status = "dismissed";
        MarkUpdated();
    }
}
