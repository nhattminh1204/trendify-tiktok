using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.AIEngine.Infrastructure;

public sealed class GeminiProvider : IAIProvider
{
    private readonly HttpClient _http;
    private readonly AICostCalculator _costCalc;
    private readonly string _apiKey;

    public string ProviderName => "google";
    public string[] SupportedModels => ["gemini-1.5-flash", "gemini-1.5-pro"];

    public GeminiProvider(HttpClient http, IConfiguration config, AICostCalculator costCalc)
    {
        _http = http;
        _costCalc = costCalc;
        _apiKey = config["AI:Gemini:ApiKey"]
            ?? throw new InvalidOperationException("Gemini API key is not configured.");

        _http.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
    }

    public async Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken ct = default)
    {
        var started = DateTimeOffset.UtcNow;

        var payload = new
        {
            contents = new[]
            {
                new { role = "user", parts = new[] { new { text = request.Prompt } } }
            },
            generationConfig = new
            {
                maxOutputTokens = request.MaxTokens,
                temperature = request.Temperature
            }
        };

        var url = $"v1beta/models/{request.Model}:generateContent?key={_apiKey}";
        var response = await _http.PostAsJsonAsync(url, payload, ct);

        if (!response.IsSuccessStatusCode)
            throw new DomainException(ErrorCodes.UpstreamError,
                $"Gemini API error: {response.StatusCode}", 502);

        using var doc = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);

        var root = doc.RootElement;
        var content = root
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? string.Empty;

        var usage = root.GetProperty("usageMetadata");
        var promptTokens = usage.GetProperty("promptTokenCount").GetInt32();
        var completionTokens = usage.GetProperty("candidatesTokenCount").GetInt32();
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
