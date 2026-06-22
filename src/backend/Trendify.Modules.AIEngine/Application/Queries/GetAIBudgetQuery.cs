using MediatR;
using Trendify.Modules.AIEngine.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.AIEngine.Application.Queries;

public sealed record GetAIBudgetQuery : IRequest<AIBudgetDto>;

public sealed record AIBudgetDto(
    decimal SpentUsd,
    decimal LimitUsd,
    decimal RemainingUsd,
    bool IsWarning,
    bool IsExceeded
);

public sealed class GetAIBudgetQueryHandler : IRequestHandler<GetAIBudgetQuery, AIBudgetDto>
{
    private readonly TokenBudgetService _budget;
    private readonly ICurrentUser _currentUser;

    public GetAIBudgetQueryHandler(TokenBudgetService budget, ICurrentUser currentUser)
    {
        _budget = budget;
        _currentUser = currentUser;
    }

    public async Task<AIBudgetDto> Handle(GetAIBudgetQuery request, CancellationToken ct)
    {
        var result = await _budget.CheckAsync(_currentUser.TenantId, ct);
        return new AIBudgetDto(
            SpentUsd: result.SpentUsd,
            LimitUsd: result.LimitUsd,
            RemainingUsd: result.RemainingUsd,
            IsWarning: result.IsWarning,
            IsExceeded: result.IsExceeded
        );
    }
}
