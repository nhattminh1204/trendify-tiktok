using FluentValidation;
using MediatR;
using Trendify.Modules.Content.Application.Queries;
using Trendify.Modules.Content.Domain;
using Trendify.Modules.Content.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.Content.Application.Commands;

public sealed record CreateIdeaCommand(
    string Title,
    string? Description = null,
    Guid? TrendId = null,
    Guid? PersonaId = null,
    string? Niche = null
) : IRequest<IdeaDto>;

public sealed class CreateIdeaCommandValidator : AbstractValidator<CreateIdeaCommand>
{
    public CreateIdeaCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(5000).When(x => x.Description != null);
    }
}

public sealed class CreateIdeaCommandHandler : IRequestHandler<CreateIdeaCommand, IdeaDto>
{
    private readonly IContentRepository _repo;
    private readonly ICurrentUser _currentUser;

    public CreateIdeaCommandHandler(IContentRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<IdeaDto> Handle(CreateIdeaCommand request, CancellationToken ct)
    {
        var idea = ContentIdea.Create(
            tenantId: _currentUser.TenantId,
            createdByUserId: _currentUser.UserId,
            title: request.Title,
            description: request.Description,
            trendId: request.TrendId,
            personaId: request.PersonaId
        );

        await _repo.AddAsync(idea, ct);
        await _repo.SaveChangesAsync(ct);

        return new IdeaDto(
            idea.Id, idea.Title, idea.Description, idea.Hook, idea.Script, idea.Cta,
            idea.Niche, idea.Status, idea.GeneratedByAI, idea.CreatedAt
        );
    }
}
