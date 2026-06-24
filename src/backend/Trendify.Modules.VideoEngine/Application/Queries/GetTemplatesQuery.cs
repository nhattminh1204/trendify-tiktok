using MediatR;

namespace Trendify.Modules.VideoEngine.Application.Queries;

public sealed record GetTemplatesQuery : IRequest<List<TemplateDto>>;

public sealed class TemplateDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string AspectRatio { get; init; } = string.Empty;
    public short MaxDurationSeconds { get; init; }
    public short MinDurationSeconds { get; init; }
    public string[]? ContentStyles { get; init; }
    public string? PreviewUrl { get; init; }
}
