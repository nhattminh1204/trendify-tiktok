namespace Trendify.Modules.AIEngine.Infrastructure;

public sealed class AICostCalculator
{
    // Prices per 1M tokens in USD — update when providers change pricing
    private static readonly Dictionary<string, (decimal Input, decimal Output)> _pricing = new()
    {
        ["gpt-4o"]             = (5.00m,  15.00m),
        ["gpt-4o-mini"]        = (0.15m,   0.60m),
        ["claude-opus-4-8"]    = (15.00m,  75.00m),
        ["claude-sonnet-4-6"]  = (3.00m,  15.00m),
        ["claude-haiku-4-5"]   = (0.25m,   1.25m),
        ["gemini-1.5-pro"]     = (3.50m,  10.50m),
        ["gemini-1.5-flash"]   = (0.075m,  0.30m),
    };

    public decimal Estimate(string model, int promptTokens, int completionTokens)
    {
        if (!_pricing.TryGetValue(model, out var price))
            return 0;

        return (promptTokens / 1_000_000m * price.Input)
             + (completionTokens / 1_000_000m * price.Output);
    }

    public bool IsKnownModel(string model) => _pricing.ContainsKey(model);
}
