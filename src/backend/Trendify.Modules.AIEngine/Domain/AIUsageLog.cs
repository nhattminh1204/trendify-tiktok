namespace Trendify.Modules.AIEngine.Domain;

// Immutable audit record — INSERT only, never UPDATE
public sealed class AIUsageLog
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid TenantId { get; private set; }
    public Guid UserId { get; private set; }
    public Guid CorrelationId { get; private set; }
    public string FeatureContext { get; private set; } = string.Empty;
    public Guid? PromptId { get; private set; }
    public string Provider { get; private set; } = string.Empty;
    public string Model { get; private set; } = string.Empty;
    public int PromptTokens { get; private set; }
    public int CompletionTokens { get; private set; }
    public decimal EstimatedCostUsd { get; private set; }
    public int DurationMs { get; private set; }

    // success | failed | budget_exceeded
    public string Status { get; private set; } = "success";

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private AIUsageLog() { }

    public static AIUsageLog Record(
        Guid tenantId,
        Guid userId,
        Guid correlationId,
        string featureContext,
        string provider,
        string model,
        int promptTokens,
        int completionTokens,
        decimal estimatedCostUsd,
        int durationMs,
        string status = "success",
        Guid? promptId = null)
    {
        return new AIUsageLog
        {
            TenantId = tenantId,
            UserId = userId,
            CorrelationId = correlationId,
            FeatureContext = featureContext,
            Provider = provider,
            Model = model,
            PromptTokens = promptTokens,
            CompletionTokens = completionTokens,
            EstimatedCostUsd = estimatedCostUsd,
            DurationMs = durationMs,
            Status = status,
            PromptId = promptId
        };
    }
}
