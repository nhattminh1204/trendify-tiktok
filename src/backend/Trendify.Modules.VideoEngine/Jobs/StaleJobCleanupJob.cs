using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Domain;

namespace Trendify.Modules.VideoEngine.Jobs;

public sealed class StaleJobCleanupJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<StaleJobCleanupJob> _logger;

    public StaleJobCleanupJob(AppDbContext db, ILogger<StaleJobCleanupJob> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var staleThreshold = DateTimeOffset.UtcNow.AddMinutes(-10);

        var staleJobs = await _db.Set<VideoRenderJob>()
            .Where(j => j.Status == "processing"
                     && j.StartedAt != null
                     && j.StartedAt < staleThreshold)
            .ToListAsync(ct);

        _logger.LogInformation("Found {Count} stale render jobs", staleJobs.Count);

        foreach (var job in staleJobs)
        {
            _logger.LogWarning("Resetting stale job {JobId} (started at {StartedAt})",
                job.Id, job.StartedAt);

            job.IncrementRetry();
        }

        if (staleJobs.Count > 0)
            await _db.SaveChangesAsync(ct);
    }
}
