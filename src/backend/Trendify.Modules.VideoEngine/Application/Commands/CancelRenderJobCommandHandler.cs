using MediatR;
using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Application.Events;
using Trendify.Modules.VideoEngine.Domain;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.VideoEngine.Application.Commands;

internal sealed class CancelRenderJobCommandHandler
    : IRequestHandler<CancelRenderJobCommand, Unit>
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDomainEventDispatcher _events;

    public CancelRenderJobCommandHandler(
        AppDbContext db, ICurrentUser currentUser, IDomainEventDispatcher events)
    {
        _db = db;
        _currentUser = currentUser;
        _events = events;
    }

    public async Task<Unit> Handle(CancelRenderJobCommand request, CancellationToken ct)
    {
        var job = await _db.Set<VideoRenderJob>()
            .FirstOrDefaultAsync(j => j.Id == request.Id, ct);

        if (job is null)
            throw new DomainException(ErrorCodes.NotFound, "Render job not found.", 404);

        if (job.Status is "cancelled" or "rendered")
            return Unit.Value;

        job.Cancel();

        await _db.SaveChangesAsync(ct);

        await _events.PublishAsync(new VideoRenderJobCancelledEvent(
            TenantId: _currentUser.TenantId,
            RenderJobId: job.Id,
            CampaignId: job.CampaignId
        ), ct);

        return Unit.Value;
    }
}
