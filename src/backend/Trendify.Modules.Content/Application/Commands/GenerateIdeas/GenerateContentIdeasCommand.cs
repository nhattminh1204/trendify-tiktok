using FluentValidation;
using MediatR;
using Trendify.Modules.Content.Application.Queries;
using Trendify.Modules.Content.Domain;
using Trendify.Modules.Content.Infrastructure;
using Trendify.Shared.Abstractions;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Trendify.Modules.Content.Application.Commands.GenerateIdeas;

public sealed record GenerateContentIdeasCommand(
    string TrendKeyword,
    string TrendNiche,
    decimal TrendScore,
    Guid? SourceTrendId = null,
    int Count = 3
) : IRequest<List<IdeaDto>>;

public sealed class GenerateContentIdeasValidator : AbstractValidator<GenerateContentIdeasCommand>
{
    public GenerateContentIdeasValidator()
    {
        RuleFor(x => x.TrendKeyword).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TrendNiche).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TrendScore).InclusiveBetween(0, 100);
        RuleFor(x => x.Count).InclusiveBetween(1, 5);
    }
}

public sealed class GenerateContentIdeasHandler
    : IRequestHandler<GenerateContentIdeasCommand, List<IdeaDto>>
{
    private readonly IAIProvider _ai;
    private readonly IContentRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GenerateContentIdeasHandler(
        IAIProvider ai,
        IContentRepository repo,
        ICurrentUser currentUser)
    {
        _ai = ai;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<IdeaDto>> Handle(
        GenerateContentIdeasCommand cmd, CancellationToken ct)
    {
        var prompt = BuildPrompt(cmd);

        var response = await _ai.CompleteAsync(new AIRequest(
            Prompt: prompt,
            Model: string.Empty,            // resolved by router tier
            MaxTokens: 1200,
            Temperature: 0.85f,
            FeatureContext: "content-brain.idea-generation",
            TenantId: _currentUser.TenantId,
            UserId: _currentUser.UserId,
            CorrelationId: Guid.NewGuid()
        ), ct);

        var rawIdeas = ParseAiResponse(response.Content, cmd.Count);
        var saved = new List<IdeaDto>(rawIdeas.Count);

        foreach (var raw in rawIdeas)
        {
            var idea = ContentIdea.Create(
                tenantId: _currentUser.TenantId,
                createdByUserId: _currentUser.UserId,
                title: raw.Title,
                description: raw.Description,
                trendId: cmd.SourceTrendId,
                generatedByAI: true,
                niche: cmd.TrendNiche
            );

            if (!string.IsNullOrWhiteSpace(raw.Hook))
                idea.SetHook(raw.Hook);

            await _repo.AddAsync(idea, ct);
            saved.Add(new IdeaDto(
                idea.Id, idea.Title, idea.Description, idea.Hook,
                idea.Script, idea.Cta, idea.Niche, idea.Status,
                idea.GeneratedByAI, idea.CreatedAt));
        }

        await _repo.SaveChangesAsync(ct);
        return saved;
    }

    private static string BuildPrompt(GenerateContentIdeasCommand cmd) => $$"""
        You are an expert TikTok content strategist.

        The keyword "{{cmd.TrendKeyword}}" is trending in the "{{cmd.TrendNiche}}" niche on TikTok
        with a trend score of {{cmd.TrendScore:F0}}/100 (higher = more viral potential).

        Generate exactly {{cmd.Count}} creative, scroll-stopping TikTok content ideas for this trend.

        Rules:
        - Each idea must be highly relevant to the keyword and niche
        - Hooks must create immediate curiosity in the first 3 seconds
        - Titles must be specific and actionable (not generic)
        - Descriptions should explain the content structure in 2-3 sentences

        Respond with ONLY a valid JSON array — no markdown, no explanation:
        [
          {
            "title": "video title (max 100 chars)",
            "hook": "opening line spoken in first 3 seconds",
            "description": "what the video covers and why viewers will engage"
          }
        ]
        """;

    private static List<IdeaFromAI> ParseAiResponse(string content, int maxCount)
    {
        try
        {
            // Strip any markdown fences the model may have added
            var json = content.Trim();
            if (json.StartsWith("```")) json = json.Split('\n', 2)[1];
            if (json.EndsWith("```")) json = json[..json.LastIndexOf("```")];
            json = json.Trim();

            var ideas = JsonSerializer.Deserialize<List<IdeaFromAI>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return (ideas ?? []).Take(maxCount).ToList();
        }
        catch
        {
            // Fallback: treat whole response as a single idea title
            return [new IdeaFromAI(
                Title: content.Length > 200 ? content[..200] : content,
                Hook: null,
                Description: null)];
        }
    }

    private sealed record IdeaFromAI(
        string Title,
        [property: JsonPropertyName("hook")]   string? Hook,
        [property: JsonPropertyName("description")] string? Description);
}
