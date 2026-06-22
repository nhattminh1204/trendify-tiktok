using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using Trendify.Shared.Abstractions;

namespace Trendify.Infrastructure.Pipeline;

// Adapted from jasontaylordev/CleanArchitecture PerformanceBehaviour.cs
// Logs a warning for any MediatR handler taking > 500ms.
// Threshold kept at 500ms — AI calls are excluded via the timeout on HttpClient level.
public sealed class PerformanceBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private const int SlowRequestThresholdMs = 500;

    private readonly ILogger<PerformanceBehaviour<TRequest, TResponse>> _logger;
    private readonly ICurrentUser _currentUser;

    public PerformanceBehaviour(
        ILogger<PerformanceBehaviour<TRequest, TResponse>> logger,
        ICurrentUser currentUser)
    {
        _logger = logger;
        _currentUser = currentUser;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var response = await next();
        sw.Stop();

        if (sw.ElapsedMilliseconds > SlowRequestThresholdMs)
        {
            _logger.LogWarning(
                "Trendify Slow Request: {RequestName} ({ElapsedMs}ms) TenantId={TenantId} UserId={UserId} {@Request}",
                typeof(TRequest).Name,
                sw.ElapsedMilliseconds,
                _currentUser.TenantId,
                _currentUser.UserId,
                request);
        }

        return response;
    }
}
