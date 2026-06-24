using MediatR;
using Trendify.Modules.Content.Domain;
using Trendify.Modules.Content.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;
using Trendify.Modules.Content.Application.Events;

namespace Trendify.Modules.Content.Application.Commands;

public sealed record ReadyIdeaCommand(Guid IdeaId) : IRequest;

public sealed class ReadyIdeaCommandHandler : IRequestHandler<ReadyIdeaCommand>
{
    private readonly IContentRepository _repo;
    private readonly ICurrentUser _currentUser;
    private readonly IDomainEventDispatcher _events;

    public ReadyIdeaCommandHandler(
        IContentRepository repo,
        ICurrentUser currentUser,
        IDomainEventDispatcher events)
    {
        _repo = repo;
        _currentUser = currentUser;
        _events = events;
    }

    public async Task Handle(ReadyIdeaCommand request, CancellationToken ct)
    {
        var idea = await _repo.GetByIdAsync(request.IdeaId, _currentUser.TenantId, ct)
            ?? throw new NotFoundException(ErrorCodes.IdeaNotFound, $"Idea {request.IdeaId} not found.");

        idea.MarkReady();
        await _repo.SaveChangesAsync(ct);

        await _events.PublishAsync(new ContentReadyEvent(
            TenantId: _currentUser.TenantId,
            IdeaId: idea.Id,
            Title: idea.Title,
            Script: idea.Script,
            CampaignId: null,
            ProductId: null
        ), ct);
    }
}
