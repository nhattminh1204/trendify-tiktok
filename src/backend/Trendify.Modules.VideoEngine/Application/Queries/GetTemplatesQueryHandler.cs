using MediatR;
using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Domain;

namespace Trendify.Modules.VideoEngine.Application.Queries;

internal sealed class GetTemplatesQueryHandler
    : IRequestHandler<GetTemplatesQuery, List<TemplateDto>>
{
    private readonly AppDbContext _db;

    public GetTemplatesQueryHandler(AppDbContext db) => _db = db;

    public async Task<List<TemplateDto>> Handle(
        GetTemplatesQuery request, CancellationToken ct)
    {
        return await _db.Set<VideoTemplate>()
            .Where(t => t.IsActive)
            .Select(t => new TemplateDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                AspectRatio = t.AspectRatio,
                MaxDurationSeconds = t.MaxDurationSeconds,
                MinDurationSeconds = t.MinDurationSeconds,
                ContentStyles = t.ContentStyles,
                PreviewUrl = t.PreviewUrl,
            })
            .ToListAsync(ct);
    }
}
