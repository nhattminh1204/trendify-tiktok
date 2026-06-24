namespace Trendify.Modules.VideoEngine.Domain;

public sealed class VideoTemplate
{
    public string Id { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string AspectRatio { get; private set; } = "9:16";
    public short MaxDurationSeconds { get; private set; } = 60;
    public short MinDurationSeconds { get; private set; } = 10;
    public string[]? ContentStyles { get; private set; }
    public string? PreviewUrl { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private VideoTemplate() { }

    public static VideoTemplate Create(
        string id, string name, string? description,
        short minDuration, short maxDuration,
        string[]? contentStyles, string? previewUrl)
    {
        return new VideoTemplate
        {
            Id = id,
            Name = name,
            Description = description,
            MinDurationSeconds = minDuration,
            MaxDurationSeconds = maxDuration,
            ContentStyles = contentStyles,
            PreviewUrl = previewUrl,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
    }
}
