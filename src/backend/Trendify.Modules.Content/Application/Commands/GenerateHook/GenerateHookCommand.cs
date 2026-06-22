using FluentValidation;
using MediatR;
using Trendify.Modules.Content.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Content.Application.Commands.GenerateHook;

public sealed record GenerateHookCommand(Guid IdeaId) : IRequest<string>;

public sealed class GenerateHookValidator : AbstractValidator<GenerateHookCommand>
{
    public GenerateHookValidator() =>
        RuleFor(x => x.IdeaId).NotEmpty();
}

public sealed class GenerateHookHandler : IRequestHandler<GenerateHookCommand, string>
{
    private readonly IAIProvider _ai;
    private readonly IContentRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GenerateHookHandler(IAIProvider ai, IContentRepository repo, ICurrentUser currentUser)
    {
        _ai = ai;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<string> Handle(GenerateHookCommand cmd, CancellationToken ct)
    {
        var idea = await _repo.GetByIdAsync(cmd.IdeaId, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.IdeaNotFound,
                $"Content idea {cmd.IdeaId} not found.");

        var prompt = $"""
            You are an expert TikTok hook writer. Your hooks get millions of views.

            Write 3 alternative opening hooks (first 3 seconds of the video) for:
            Title: "{idea.Title}"
            Niche: "{idea.Niche ?? "general"}"
            {(idea.Description != null ? $"Context: {idea.Description}" : "")}

            Requirements:
            - Each hook must be 1-2 sentences max
            - Create immediate curiosity, shock, or FOMO
            - No generic openers ("Hey guys", "In this video", "Today I'll show you")
            - Write directly to the viewer ("You", "Your", "Have you ever")

            Return ONLY a JSON array of 3 strings:
            ["hook 1", "hook 2", "hook 3"]
            """;

        var response = await _ai.CompleteAsync(new AIRequest(
            Prompt: prompt,
            Model: string.Empty,
            MaxTokens: 300,
            Temperature: 0.9f,
            FeatureContext: "content-brain.hook-generation",
            TenantId: _currentUser.TenantId,
            UserId: _currentUser.UserId,
            CorrelationId: Guid.NewGuid()
        ), ct);

        // Parse and pick the first valid hook
        var hook = ParseBestHook(response.Content) ?? response.Content.Trim();

        idea.SetHook(hook);
        await _repo.SaveChangesAsync(ct);

        return hook;
    }

    private static string? ParseBestHook(string content)
    {
        try
        {
            var json = content.Trim()
                .TrimStart('`').TrimEnd('`').Trim();
            if (json.StartsWith("```")) json = json.Split('\n', 2)[1];
            if (json.EndsWith("```")) json = json[..json.LastIndexOf("```")].Trim();

            var hooks = System.Text.Json.JsonSerializer.Deserialize<List<string>>(json);
            return hooks?.FirstOrDefault(h => !string.IsNullOrWhiteSpace(h))?.Trim();
        }
        catch
        {
            return null;
        }
    }
}
