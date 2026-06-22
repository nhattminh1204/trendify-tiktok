using MediatR;
using Trendify.Modules.Audience.Infrastructure;
using Trendify.Shared.Abstractions;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Audience.Application.Queries;

public sealed record GetAudienceQuery(Guid SocialAccountId) : IRequest<AudienceDto>;

public sealed record AudienceDto(
    Guid Id,
    Guid SocialAccountId,
    string Niche,
    long TotalFollowers,
    decimal AvgEngagementRate,
    string[] TopInterests,
    string Status,
    DateTimeOffset? LastAnalysedAt,
    List<PersonaDto> Personas
);

public sealed record PersonaDto(
    Guid Id,
    string Name,
    string Description,
    int AgeMin,
    int AgeMax,
    string Gender,
    string[] Interests,
    string[] PainPoints,
    string[] ContentPreferences,
    decimal Percentage
);

public sealed class GetAudienceQueryHandler : IRequestHandler<GetAudienceQuery, AudienceDto>
{
    private readonly IAudienceRepository _repo;
    private readonly ICurrentUser _currentUser;

    public GetAudienceQueryHandler(IAudienceRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<AudienceDto> Handle(GetAudienceQuery request, CancellationToken ct)
    {
        var profile = await _repo.GetProfileAsync(
            _currentUser.TenantId, request.SocialAccountId, ct)
            ?? throw new NotFoundException("AUDIENCE_NOT_FOUND",
                $"No audience profile for account {request.SocialAccountId}.");

        var personas = await _repo.GetPersonasAsync(profile.Id, _currentUser.TenantId, ct);

        return new AudienceDto(
            Id: profile.Id,
            SocialAccountId: profile.SocialAccountId,
            Niche: profile.Niche,
            TotalFollowers: profile.TotalFollowers,
            AvgEngagementRate: profile.AvgEngagementRate,
            TopInterests: profile.TopInterests,
            Status: profile.Status,
            LastAnalysedAt: profile.LastAnalysedAt,
            Personas: personas.Select(p => new PersonaDto(
                p.Id, p.Name, p.Description, p.AgeMin, p.AgeMax,
                p.Gender, p.Interests, p.PainPoints, p.ContentPreferences, p.Percentage
            )).ToList()
        );
    }
}
