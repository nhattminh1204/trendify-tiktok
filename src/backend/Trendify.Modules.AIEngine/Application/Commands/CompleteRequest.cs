using FluentValidation;
using MediatR;
using Trendify.Modules.AIEngine.Domain;
using Trendify.Modules.AIEngine.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Infrastructure.Persistence;

namespace Trendify.Modules.AIEngine.Application.Queries;

public sealed record CompleteRequest(
    string Prompt,
    string FeatureContext,
    string? Model = null,
    int MaxTokens = 1024,
    float Temperature = 0.7f
) : IRequest<AICompleteDto>;

public sealed record AICompleteDto(
    string Content,
    string Provider,
    string Model,
    int TotalTokens,
    decimal EstimatedCostUsd,
    int DurationMs
);

public sealed class CompleteRequestValidator : AbstractValidator<CompleteRequest>
{
    public CompleteRequestValidator()
    {
        RuleFor(x => x.Prompt).NotEmpty().MaximumLength(32_000);
        RuleFor(x => x.FeatureContext).NotEmpty().MaximumLength(200);
        RuleFor(x => x.MaxTokens).InclusiveBetween(1, 8192);
        RuleFor(x => x.Temperature).InclusiveBetween(0f, 2f);
    }
}

public sealed class CompleteRequestHandler : IRequestHandler<CompleteRequest, AICompleteDto>
{
    private readonly IAIProvider _ai;
    private readonly ICurrentUser _currentUser;
    private readonly AppDbContext _db;

    public CompleteRequestHandler(IAIProvider ai, ICurrentUser currentUser, AppDbContext db)
    {
        _ai = ai;
        _currentUser = currentUser;
        _db = db;
    }

    public async Task<AICompleteDto> Handle(CompleteRequest req, CancellationToken ct)
    {
        var correlationId = Guid.NewGuid();
        var aiRequest = new AIRequest(
            Prompt: req.Prompt,
            Model: req.Model ?? string.Empty,
            MaxTokens: req.MaxTokens,
            Temperature: req.Temperature,
            FeatureContext: req.FeatureContext,
            TenantId: _currentUser.TenantId,
            UserId: _currentUser.UserId,
            CorrelationId: correlationId
        );

        var response = await _ai.CompleteAsync(aiRequest, ct);

        var log = AIUsageLog.Record(
            tenantId: _currentUser.TenantId,
            userId: _currentUser.UserId,
            correlationId: correlationId,
            featureContext: req.FeatureContext,
            provider: response.Provider,
            model: response.Model,
            promptTokens: response.PromptTokens,
            completionTokens: response.CompletionTokens,
            estimatedCostUsd: response.EstimatedCostUsd,
            durationMs: (int)response.Duration.TotalMilliseconds
        );

        _db.Set<AIUsageLog>().Add(log);
        await _db.SaveChangesAsync(ct);

        return new AICompleteDto(
            Content: response.Content,
            Provider: response.Provider,
            Model: response.Model,
            TotalTokens: response.PromptTokens + response.CompletionTokens,
            EstimatedCostUsd: response.EstimatedCostUsd,
            DurationMs: (int)response.Duration.TotalMilliseconds
        );
    }
}
