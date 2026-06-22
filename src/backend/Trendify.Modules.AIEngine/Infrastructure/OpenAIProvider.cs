using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Trendify.Modules.AIEngine.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.AIEngine.Infrastructure;

public sealed class OpenAIProvider : IAIProvider
{
    private readonly HttpClient _http;
    private readonly AICostCalculator _costCalc;
    private readonly string _apiKey;

    public string ProviderName => "openai";
    public string[] SupportedModels => ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"];

    public OpenAIProvider(HttpClient http, IConfiguration config, AICostCalculator costCalc)
    {
        _http = http;
        _costCalc = costCalc;
        _apiKey = config["AI:OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI API key is not configured.");

        _http.BaseAddress = new Uri("https://api.openai.com/");
        _http.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken ct = default)
    {
        var started = DateTimeOffset.UtcNow;

        var payload = new
        {
            model = request.Model,
            messages = new[]
            {
                new { role = "user", content = request.Prompt }
            },
            max_tokens = request.MaxTokens,
            temperature = request.Temperature
        };

        var response = await _http.PostAsJsonAsync("v1/chat/completions", payload, ct);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(ct);
            throw new DomainException(ErrorCodes.UpstreamError,
                $"OpenAI API error: {response.StatusCode}", 502);
        }

        using var doc = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);

        var root = doc.RootElement;
        var content = root
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? string.Empty;

        var promptTokens = root.GetProperty("usage").GetProperty("prompt_tokens").GetInt32();
        var completionTokens = root.GetProperty("usage").GetProperty("completion_tokens").GetInt32();
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
