using MediatR;
using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Domain;
using Trendify.Shared.Responses;

namespace Trendify.Modules.VideoEngine.Application.Queries;

internal sealed class GetRenderJobsQueryHandler
    : IRequestHandler<GetRenderJobsQuery, PagedResult<RenderJobSummaryDto>>
{
    private readonly AppDbContext _db;

    public GetRenderJobsQueryHandler(AppDbContext db) => _db = db;

    public async Task<PagedResult<RenderJobSummaryDto>> Handle(
        GetRenderJobsQuery request, CancellationToken ct)
    {
        var query = _db.Set<VideoRenderJob>().AsQueryable();

        if (request.CampaignId.HasValue)
            query = query.Where(j => j.CampaignId == request.CampaignId.Value);

        if (!string.IsNullOrEmpty(request.Status))
            query = query.Where(j => j.Status == request.Status);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(j => new RenderJobSummaryDto
            {
                Id = j.Id,
                CampaignId = j.CampaignId,
                Status = j.Status,
                TemplateId = j.TemplateId,
                VoiceId = j.VoiceId,
                DurationSeconds = j.DurationSeconds,
                OutputUrl = j.OutputUrl,
                ThumbnailUrl = j.ThumbnailUrl,
                RetryCount = j.RetryCount,
                ErrorMessage = j.ErrorMessage,
                QueuedAt = j.QueuedAt,
                CompletedAt = j.CompletedAt,
            })
            .ToListAsync(ct);

        return new PagedResult<RenderJobSummaryDto>(items, null, false, total);
    }
}
