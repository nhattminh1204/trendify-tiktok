using Trendify.Modules.VideoEngine.Domain;

namespace Trendify.Modules.VideoEngine.Infrastructure;

public interface IVideoEngineRepository
{
    Task<VideoRenderJob?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<VideoRenderJob>> GetQueuedJobsAsync(CancellationToken ct = default);
    Task AddJobAsync(VideoRenderJob job, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
