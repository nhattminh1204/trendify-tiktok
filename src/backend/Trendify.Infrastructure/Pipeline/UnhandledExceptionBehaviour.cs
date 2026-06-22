using MediatR;
using Microsoft.Extensions.Logging;

namespace Trendify.Infrastructure.Pipeline;

// Adapted from jasontaylordev/CleanArchitecture UnhandledExceptionBehaviour.cs
// Ensures every unhandled exception in a MediatR handler is logged with full context
// before being re-thrown — critical for Seq visibility.
public sealed class UnhandledExceptionBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<UnhandledExceptionBehaviour<TRequest, TResponse>> _logger;

    public UnhandledExceptionBehaviour(
        ILogger<UnhandledExceptionBehaviour<TRequest, TResponse>> logger)
        => _logger = logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        try
        {
            return await next();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Trendify Unhandled Exception: {RequestName} {@Request}",
                typeof(TRequest).Name, request);
            throw;
        }
    }
}
