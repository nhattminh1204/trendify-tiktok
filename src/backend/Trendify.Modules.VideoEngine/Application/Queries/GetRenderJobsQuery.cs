using MediatR;
using Trendify.Shared.Responses;

namespace Trendify.Modules.VideoEngine.Application.Queries;

public sealed record GetRenderJobsQuery(
    Guid? CampaignId = null,
    string? Status = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<RenderJobSummaryDto>>;

public sealed class RenderJobSummaryDto
{
    public Guid Id { get; init; }
    public Guid? CampaignId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string TemplateId { get; init; } = string.Empty;
    public string VoiceId { get; init; } = string.Empty;
    public short? DurationSeconds { get; init; }
    public string? OutputUrl { get; init; }
    public string? ThumbnailUrl { get; init; }
    public short RetryCount { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTimeOffset? QueuedAt { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
}
