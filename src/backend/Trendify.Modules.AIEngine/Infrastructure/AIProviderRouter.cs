using Microsoft.Extensions.Logging;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.AIEngine.Infrastructure;

public sealed class AIProviderRouter : IAIProvider
{
    private readonly OpenAIProvider _openAI;
    private readonly AnthropicProvider _anthropic;
    private readonly GeminiProvider _gemini;
    private readonly TokenBudgetService _budget;
    private readonly ILogger<AIProviderRouter> _logger;

    // Tier → (Primary model, Fallback model)
    private static readonly Dictionary<string, (string Primary, string Fallback)> _tiers = new()
    {
        ["micro"]    = ("gemini-1.5-flash",  "claude-haiku-4-5"),
        ["standard"] = ("gpt-4o-mini",       "claude-sonnet-4-6"),
        ["premium"]  = ("gpt-4o",            "claude-opus-4-8"),
    };

    private static readonly Dictionary<string, string> _featureTiers = new()
    {
        ["content-brain.hook-generation"]   = "micro",
        ["content-brain.cta-generation"]    = "micro",
        ["content-brain.idea-generation"]   = "standard",
        ["content-brain.script-short"]      = "standard",
        ["content-brain.script-long"]       = "premium",
        ["content-brain.strategy"]          = "premium",
        ["audience.persona-generation"]     = "standard",
        ["learning.pattern-description"]    = "premium",
        ["trends.scoring"]                  = "micro",
    };

    public string ProviderName => "router";
    public string[] SupportedModels => _tiers.Values
        .SelectMany(t => new[] { t.Primary, t.Fallback })
        .Distinct().ToArray();

    public AIProviderRouter(
        OpenAIProvider openAI,
        AnthropicProvider anthropic,
        GeminiProvider gemini,
        TokenBudgetService budget,
        ILogger<AIProviderRouter> logger)
    {
        _openAI = openAI;
        _anthropic = anthropic;
        _gemini = gemini;
        _budget = budget;
        _logger = logger;
    }

    public async Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken ct = default)
    {
        // 1. Budget check
        var budgetResult = await _budget.CheckAsync(request.TenantId, ct);
        if (budgetResult.IsExceeded)
            throw new DomainException(ErrorCodes.AIBudgetExceeded,
                $"Monthly AI budget exceeded. Spent: ${budgetResult.SpentUsd:F2} of ${budgetResult.LimitUsd:F2}.", 429);

        // 2. Determine model
        var model = string.IsNullOrEmpty(request.Model)
            ? ResolveModel(request.FeatureContext)
            : request.Model;

        // 3. Try primary provider
        var provider = GetProvider(model);
        var requestWithModel = request with { Model = model };

        try
        {
            var response = await provider.CompleteAsync(requestWithModel, ct);
            _logger.LogInformation(
                "AI call success. Feature={Feature} Provider={Provider} Model={Model} Tokens={Tokens} Cost=${Cost}",
                request.FeatureContext, provider.ProviderName, model,
                response.PromptTokens + response.CompletionTokens, response.EstimatedCostUsd);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI primary provider failed. Feature={Feature} Model={Model}. Trying fallback.",
                request.FeatureContext, model);

            // 4. Fallback
            var fallbackModel = GetFallbackModel(model);
            var fallbackProvider = GetProvider(fallbackModel);
            var fallbackRequest = request with { Model = fallbackModel };

            return await fallbackProvider.CompleteAsync(fallbackRequest, ct);
        }
    }

    private string ResolveModel(string featureContext)
    {
        var tier = _featureTiers.GetValueOrDefault(featureContext, "standard");
        return _tiers[tier].Primary;
    }

    private string GetFallbackModel(string model)
    {
        foreach (var (_, (primary, fallback)) in _tiers)
            if (primary == model) return fallback;
        return "gpt-4o-mini";
    }

    private IAIProvider GetProvider(string model) => model switch
    {
        var m when m.StartsWith("gpt")     => _openAI,
        var m when m.StartsWith("claude")  => _anthropic,
        var m when m.StartsWith("gemini")  => _gemini,
        _                                  => _openAI
    };
}
