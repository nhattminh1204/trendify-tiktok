using Hangfire;
using MediatR;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Application.Events;
using Trendify.Modules.VideoEngine.Domain;
using Trendify.Modules.VideoEngine.Jobs;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.VideoEngine.Application.Commands;

internal sealed class CreateRenderJobCommandHandler
    : IRequestHandler<CreateRenderJobCommand, Guid>
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDomainEventDispatcher _events;
    private readonly IBackgroundJobClient _jobs;

    public CreateRenderJobCommandHandler(
        AppDbContext db,
        ICurrentUser currentUser,
        IDomainEventDispatcher events,
        IBackgroundJobClient jobs)
    {
        _db = db;
        _currentUser = currentUser;
        _events = events;
        _jobs = jobs;
    }

    public async Task<Guid> Handle(CreateRenderJobCommand request, CancellationToken ct)
    {
        var job = VideoRenderJob.Create(
            tenantId: _currentUser.TenantId,
            campaignId: request.CampaignId,
            contentIdeaId: request.ContentIdeaId,
            templateId: request.TemplateId,
            voiceId: request.VoiceId,
            ttsEngine: request.TtsEngine,
            voiceSpeed: 1.00m,
            scriptText: request.ScriptText,
            captionText: request.CaptionText,
            hashtags: request.Hashtags);

        _db.Set<VideoRenderJob>().Add(job);

        if (request.AssetUrls is not null)
        {
            for (int i = 0; i < request.AssetUrls.Length; i++)
            {
                var asset = VideoAsset.Create(
                    _currentUser.TenantId, job.Id, "product_image",
                    request.AssetUrls[i], (short)i);
                _db.Set<VideoAsset>().Add(asset);
            }
        }

        await _db.SaveChangesAsync(ct);

        _jobs.Enqueue<VideoRenderWorker>(w =>
            w.RunAsync(job.Id, CancellationToken.None));

        await _events.PublishAsync(new VideoRenderJobCreatedEvent(
            TenantId: _currentUser.TenantId,
            RenderJobId: job.Id,
            CampaignId: job.CampaignId,
            ContentIdeaId: job.ContentIdeaId,
            TemplateId: job.TemplateId
        ), ct);

        return job.Id;
    }
}
