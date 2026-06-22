using MediatR;
using Trendify.Modules.Content.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Content.Application.Commands;

public sealed record ApproveIdeaCommand(Guid IdeaId) : IRequest;

public sealed class ApproveIdeaCommandHandler : IRequestHandler<ApproveIdeaCommand>
{
    private readonly IContentRepository _repo;
    private readonly ICurrentUser _currentUser;

    public ApproveIdeaCommandHandler(IContentRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveIdeaCommand request, CancellationToken ct)
    {
        var idea = await _repo.GetByIdAsync(request.IdeaId, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.IdeaNotFound, $"Idea {request.IdeaId} not found.");

        idea.Approve();
        await _repo.SaveChangesAsync(ct);
    }
}

public sealed record PublishIdeaCommand(Guid IdeaId) : IRequest;

public sealed class PublishIdeaCommandHandler : IRequestHandler<PublishIdeaCommand>
{
    private readonly IContentRepository _repo;
    private readonly ICurrentUser _currentUser;

    public PublishIdeaCommandHandler(IContentRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(PublishIdeaCommand request, CancellationToken ct)
    {
        var idea = await _repo.GetByIdAsync(request.IdeaId, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.IdeaNotFound, $"Idea {request.IdeaId} not found.");

        idea.MarkPublished();
        await _repo.SaveChangesAsync(ct);
    }
}
