using Trendify.Shared.Domain;

namespace Trendify.Modules.Trends.Domain;

public sealed class TrendWatchlist : TenantEntity
{
    public Guid TrendDetectionId { get; private set; }
    public string? Notes { get; private set; }

    private TrendWatchlist() { }

    public static TrendWatchlist Create(Guid tenantId, Guid trendDetectionId)
    {
        return new TrendWatchlist
        {
            TenantId = tenantId,
            TrendDetectionId = trendDetectionId
        };
    }

    public void UpdateNotes(string? notes)
    {
        Notes = notes;
        MarkUpdated();
    }
}
