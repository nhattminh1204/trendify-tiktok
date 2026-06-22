namespace Trendify.Shared.Abstractions;

public interface IAIProvider
{
    string ProviderName { get; }
    string[] SupportedModels { get; }
    Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken ct = default);
}

public sealed record AIRequest(
    string Prompt,
    string Model,
    int MaxTokens,
    float Temperature = 0.7f,
    string FeatureContext = "",
    Guid TenantId = default,
    Guid UserId = default,
    Guid CorrelationId = default,
    Guid? PromptId = null
);

public sealed record AIResponse(
    string Content,
    int PromptTokens,
    int CompletionTokens,
    string Provider,
    string Model,
    decimal EstimatedCostUsd,
    TimeSpan Duration
);
