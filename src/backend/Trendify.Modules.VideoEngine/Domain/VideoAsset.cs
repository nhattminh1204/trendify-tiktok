using Trendify.Shared.Domain;

namespace Trendify.Modules.VideoEngine.Domain;

public sealed class VideoAsset : TenantEntity
{
    public Guid RenderJobId { get; private set; }
    public string AssetType { get; private set; } = string.Empty;
    public string SourceUrl { get; private set; } = string.Empty;
    public string? MinioUrl { get; private set; }
    public short SortOrder { get; private set; }

    private VideoAsset() { }

    public static VideoAsset Create(
        Guid tenantId,
        Guid renderJobId,
        string assetType,
        string sourceUrl,
        short sortOrder)
    {
        return new VideoAsset
        {
            TenantId = tenantId,
            RenderJobId = renderJobId,
            AssetType = assetType,
            SourceUrl = sourceUrl,
            SortOrder = sortOrder,
        };
    }

    public void SetMinioUrl(string minioUrl)
    {
        MinioUrl = minioUrl;
        MarkUpdated();
    }
}
