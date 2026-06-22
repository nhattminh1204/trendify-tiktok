using MediatR;
using Trendify.Modules.Content.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Content.Application.Queries;

public sealed record GetIdeasQuery(string? Status = null, int Limit = 20) : IRequest<List<IdeaDto>>;

public sealed record IdeaDto(
    Guid Id,
    string Title,
    string? Description,
    string? Hook,
    string? Script,
    string? Cta,
    string? Niche,
    string Status,
    bool GeneratedByAI,
    DateTimeOffset CreatedAt
);

public sealed class GetIdeasQueryHandler : IRequestHandler<GetIdeasQuery, List<IdeaDto>>
{
    private readonly IContentRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetIdeasQueryHandler(IContentRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<List<IdeaDto>> Handle(GetIdeasQuery request, CancellationToken ct)
    {
        var ideas = await _repo.GetByStatusAsync(
            _currentUser.TenantId, request.Status, request.Limit, ct);

        return ideas.Select(i => new IdeaDto(
            i.Id, i.Title, i.Description, i.Hook, i.Script, i.Cta,
            i.Niche, i.Status, i.GeneratedByAI, i.CreatedAt
        )).ToList();
    }
}
