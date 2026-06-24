using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Application.Events;
using Trendify.Modules.VideoEngine.Domain;
using Trendify.Modules.VideoEngine.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.VideoEngine.Jobs;

public sealed class VideoRenderWorker
{
    private readonly AppDbContext _db;
    private readonly IVideoEngineRepository _repo;
    private readonly PythonSidecarService _pythonSidecar;
    private readonly IDomainEventDispatcher _events;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<VideoRenderWorker> _logger;

    public VideoRenderWorker(
        AppDbContext db,
        IVideoEngineRepository repo,
        PythonSidecarService pythonSidecar,
        IDomainEventDispatcher events,
        ICurrentUser currentUser,
        ILogger<VideoRenderWorker> logger)
    {
        _db = db;
        _repo = repo;
        _pythonSidecar = pythonSidecar;
        _events = events;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task RunAsync(Guid jobId, CancellationToken ct = default)
    {
        var job = await _repo.GetByIdAsync(jobId, ct);
        if (job is null)
        {
            _logger.LogWarning("Render job {JobId} not found", jobId);
            return;
        }

        if (job.Status != "queued")
        {
            _logger.LogWarning("Render job {JobId} is not queued (status: {Status})", jobId, job.Status);
            return;
        }

        _logger.LogInformation("Starting render job {JobId} (template: {Template})", jobId, job.TemplateId);

        job.StartProcessing();
        await _repo.SaveChangesAsync(ct);

        var assets = await _db.Set<VideoAsset>()
            .Where(a => a.RenderJobId == jobId && a.DeletedAt == null)
            .OrderBy(a => a.SortOrder)
            .Select(a => new { a.SourceUrl, a.AssetType })
            .ToListAsync(ct);

        var jobConfig = new
        {
            script_text = job.ScriptText,
            voice_id = job.VoiceId,
            tts_engine = job.TtsEngine,
            voice_speed = job.VoiceSpeed,
            template_id = job.TemplateId,
            scene_duration = 10,
            output_prefix = $"videos/{_currentUser.TenantId}/{jobId}",
            assets = assets.Select(a => new { url = a.SourceUrl, type = a.AssetType }).ToList(),
        };

        var result = await _pythonSidecar.CallAsync(
            jobId.ToString(), jobConfig, ct);

        if (result.Status == "success" && result.OutputUrl is not null)
        {
            job.Complete(
                outputUrl: result.OutputUrl,
                thumbnailUrl: null,
                durationSeconds: result.DurationSeconds ?? 0,
                fileSizeBytes: result.FileSizeBytes ?? 0);

            await _repo.SaveChangesAsync(ct);

            var targetAccountIds = await _db.Set<VideoRenderJob>()
                .Where(j => j.Id == jobId)
                .Select(j => (Guid?)j.CampaignId)
                .FirstOrDefaultAsync(ct);

            await _events.PublishAsync(new VideoRenderedEvent(
                TenantId: _currentUser.TenantId,
                RenderJobId: job.Id,
                CampaignId: job.CampaignId,
                ContentIdeaId: job.ContentIdeaId,
                OutputUrl: result.OutputUrl,
                ThumbnailUrl: null,
                DurationSeconds: result.DurationSeconds ?? 0,
                CaptionText: job.CaptionText,
                Hashtags: job.Hashtags,
                TargetAccountIds: targetAccountIds.HasValue ? [targetAccountIds.Value] : null
            ), ct);

            _logger.LogInformation("Render job {JobId} completed successfully", jobId);
        }
        else
        {
            job.Fail(result.Error ?? "Unknown error");
            await _repo.SaveChangesAsync(ct);

            await _events.PublishAsync(new VideoRenderFailedEvent(
                TenantId: _currentUser.TenantId,
                RenderJobId: job.Id,
                CampaignId: job.CampaignId,
                ErrorMessage: result.Error ?? "Unknown error"
            ), ct);

            _logger.LogError("Render job {JobId} failed: {Error}", jobId, result.Error);
        }
    }
}
