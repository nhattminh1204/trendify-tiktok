using FluentValidation;
using MediatR;
using Trendify.Modules.Trends.Domain;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Trends.Application.Commands;

public sealed record AddCompetitorCommand(string TikTokUsername, string? Notes = null) : IRequest;

public sealed class AddCompetitorCommandValidator : AbstractValidator<AddCompetitorCommand>
{
    public AddCompetitorCommandValidator()
    {
        RuleFor(x => x.TikTokUsername)
            .NotEmpty().WithMessage("TikTok username is required.")
            .MaximumLength(100);
    }
}

public sealed class AddCompetitorCommandHandler : IRequestHandler<AddCompetitorCommand>
{
    private readonly ITrendsRepository _repo;
    private readonly ICurrentUser _currentUser;

    public AddCompetitorCommandHandler(ITrendsRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(AddCompetitorCommand request, CancellationToken ct)
    {
        var exists = await _repo.CompetitorExistsAsync(
            _currentUser.TenantId, request.TikTokUsername, ct);
        if (exists)
            throw new DomainException("COMPETITOR_ALREADY_EXISTS",
                $"Competitor @{request.TikTokUsername} is already being monitored.");

        var competitor = CompetitorProfile.Create(
            _currentUser.TenantId,
            request.TikTokUsername,
            request.Notes);

        await _repo.AddCompetitorAsync(competitor, ct);
        await _repo.SaveChangesAsync(ct);
    }
}
