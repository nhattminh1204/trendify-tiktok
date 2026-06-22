using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.AIEngine.Infrastructure;

public sealed class AnthropicProvider : IAIProvider
{
    private readonly HttpClient _http;
    private readonly AICostCalculator _costCalc;

    public string ProviderName => "anthropic";
    public string[] SupportedModels => ["claude-opus-4-8", "claude-sonnet-4-6", "claude-haiku-4-5"];

    public AnthropicProvider(HttpClient http, IConfiguration config, AICostCalculator costCalc)
    {
        _http = http;
        _costCalc = costCalc;

        var apiKey = config["AI:Anthropic:ApiKey"]
            ?? throw new InvalidOperationException("Anthropic API key is not configured.");

        _http.BaseAddress = new Uri("https://api.anthropic.com/");
        _http.DefaultRequestHeaders.Add("x-api-key", apiKey);
        _http.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
    }

    public async Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken ct = default)
    {
        var started = DateTimeOffset.UtcNow;

        var payload = new
        {
            model = request.Model,
            max_tokens = request.MaxTokens,
            temperature = request.Temperature,
            messages = new[]
            {
                new { role = "user", content = request.Prompt }
            }
        };

        var response = await _http.PostAsJsonAsync("v1/messages", payload, ct);

        if (!response.IsSuccessStatusCode)
            throw new DomainException(ErrorCodes.UpstreamError,
                $"Anthropic API error: {response.StatusCode}", 502);

        using var doc = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);

        var root = doc.RootElement;
        var content = root
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? string.Empty;

        var promptTokens = root.GetProperty("usage").GetProperty("input_tokens").GetInt32();
        var completionTokens = root.GetProperty("usage").GetProperty("output_tokens").GetInt32();
        var cost = _costCalc.Estimate(request.Model, promptTokens, completionTokens);

        return new AIResponse(
            Content: content,
            PromptTokens: promptTokens,
            CompletionTokens: completionTokens,
            Provider: ProviderName,
            Model: request.Model,
            EstimatedCostUsd: cost,
            Duration: DateTimeOffset.UtcNow - started
        );
    }
}
