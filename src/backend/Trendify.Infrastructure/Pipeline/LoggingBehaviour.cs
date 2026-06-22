using MediatR;
using Microsoft.Extensions.Logging;
using Trendify.Shared.Abstractions;

namespace Trendify.Infrastructure.Pipeline;

// Adapted from jasontaylordev/CleanArchitecture LoggingBehaviour.cs
// Logs every request with user context. Appears in Seq with CorrelationId enrichment.
public sealed class LoggingBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehaviour<TRequest, TResponse>> _logger;
    private readonly ICurrentUser _currentUser;

    public LoggingBehaviour(
        ILogger<LoggingBehaviour<TRequest, TResponse>> logger,
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
        var name = typeof(TRequest).Name;

        _logger.LogInformation(
            "Trendify Request: {RequestName} TenantId={TenantId} UserId={UserId} {@Request}",
            name,
            _currentUser.TenantId,
            _currentUser.UserId,
            request);

        return await next();
    }
}
