using Hangfire;
using MediatR;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Content.Application.Events;
using Trendify.Modules.VideoEngine.Domain;
using Trendify.Modules.VideoEngine.Jobs;

namespace Trendify.Modules.VideoEngine.Application.Events;

public sealed class ContentReadyEventHandler : INotificationHandler<ContentReadyEvent>
{
    private readonly AppDbContext _db;
    private readonly IBackgroundJobClient _jobs;

    public ContentReadyEventHandler(AppDbContext db, IBackgroundJobClient jobs)
    {
        _db = db;
        _jobs = jobs;
    }

    public async Task Handle(ContentReadyEvent notification, CancellationToken ct)
    {
        var job = VideoRenderJob.Create(
            tenantId: notification.TenantId,
            campaignId: notification.CampaignId,
            contentIdeaId: notification.IdeaId,
            templateId: "product-review-v1",
            voiceId: "vi-VN-HoaiMyNeural",
            ttsEngine: "edge",
            voiceSpeed: 1.00m,
            scriptText: notification.Script ?? notification.Title,
            captionText: null,
            hashtags: null);

        _db.Set<VideoRenderJob>().Add(job);
        await _db.SaveChangesAsync(ct);

        _jobs.Enqueue<VideoRenderWorker>(w =>
            w.RunAsync(job.Id, CancellationToken.None));
    }
}
