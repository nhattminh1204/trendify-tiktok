using FluentValidation;
using MediatR;
using Trendify.Shared.Errors;

namespace Trendify.Infrastructure.Pipeline;

// Adapted from jasontaylordev/CleanArchitecture ValidationBehaviour.cs
// Auto-runs all FluentValidation validators registered for the request type
// before the handler executes. Eliminates manual ValidateAsync() calls in every handler.
public sealed class ValidationBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehaviour(IEnumerable<IValidator<TRequest>> validators)
        => _validators = validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);

        var results = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, ct)));

        var failures = results
            .Where(r => r.Errors.Count != 0)
            .SelectMany(r => r.Errors)
            .ToList();

        if (failures.Count != 0)
        {
            // Map FluentValidation fields to the tuple shape ValidationException expects
            var fields = failures
                .Select(f => (Field: f.PropertyName, Message: f.ErrorMessage))
                .ToList()
                .AsReadOnly();

            throw new Shared.Errors.ValidationException(fields);
        }

        return await next();
    }
}
