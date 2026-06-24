using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Domain;

namespace Trendify.Modules.VideoEngine.Infrastructure;

public sealed class VideoEngineRepository : IVideoEngineRepository
{
    private readonly AppDbContext _db;

    public VideoEngineRepository(AppDbContext db) => _db = db;

    public async Task<VideoRenderJob?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Set<VideoRenderJob>().FirstOrDefaultAsync(j => j.Id == id, ct);

    public async Task<List<VideoRenderJob>> GetQueuedJobsAsync(CancellationToken ct = default)
        => await _db.Set<VideoRenderJob>()
            .Where(j => j.Status == "queued")
            .OrderBy(j => j.QueuedAt)
            .Take(10)
            .ToListAsync(ct);

    public async Task AddJobAsync(VideoRenderJob job, CancellationToken ct = default)
        => await _db.Set<VideoRenderJob>().AddAsync(job, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}
