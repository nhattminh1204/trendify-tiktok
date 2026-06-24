using MediatR;
using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Domain;
using Trendify.Shared.Errors;

namespace Trendify.Modules.VideoEngine.Application.Queries;

internal sealed class GetRenderJobDetailQueryHandler
    : IRequestHandler<GetRenderJobDetailQuery, RenderJobDetailDto?>
{
    private readonly AppDbContext _db;

    public GetRenderJobDetailQueryHandler(AppDbContext db) => _db = db;

    public async Task<RenderJobDetailDto?> Handle(
        GetRenderJobDetailQuery request, CancellationToken ct)
    {
        var job = await _db.Set<VideoRenderJob>()
            .FirstOrDefaultAsync(j => j.Id == request.Id, ct);

        if (job is null)
            return null;

        return new RenderJobDetailDto
        {
            Id = job.Id,
            CampaignId = job.CampaignId,
            ContentIdeaId = job.ContentIdeaId,
            Status = job.Status,
            RenderType = job.RenderType,
            TemplateId = job.TemplateId,
            VoiceId = job.VoiceId,
            TtsEngine = job.TtsEngine,
            VoiceSpeed = job.VoiceSpeed,
            ScriptText = job.ScriptText,
            CaptionText = job.CaptionText,
            Hashtags = job.Hashtags,
            OutputUrl = job.OutputUrl,
            ThumbnailUrl = job.ThumbnailUrl,
            DurationSeconds = job.DurationSeconds,
            FileSizeBytes = job.FileSizeBytes,
            ErrorMessage = job.ErrorMessage,
            RetryCount = job.RetryCount,
            ViralTemplateId = job.ViralTemplateId,
            AiModelId = job.AiModelId,
            QueuedAt = job.QueuedAt,
            StartedAt = job.StartedAt,
            CompletedAt = job.CompletedAt,
            CreatedAt = job.CreatedAt,
        };
    }
}
