namespace Trendify.Shared.Errors;

public class DomainException : Exception
{
    public string Code { get; }
    public int StatusCode { get; }

    public DomainException(string code, string message, int statusCode = 400)
        : base(message)
    {
        Code = code;
        StatusCode = statusCode;
    }
}

public class NotFoundException : DomainException
{
    public NotFoundException(string code, string message)
        : base(code, message, 404) { }
}

public class UnauthorizedException : DomainException
{
    public UnauthorizedException(string message = "Unauthorized")
        : base(ErrorCodes.Unauthorized, message, 401) { }
}

public class ForbiddenException : DomainException
{
    public ForbiddenException(string message = "Forbidden")
        : base(ErrorCodes.Forbidden, message, 403) { }
}

public class ValidationException : DomainException
{
    public IReadOnlyList<(string Field, string Message)> Failures { get; }

    public ValidationException(IReadOnlyList<(string Field, string Message)> failures)
        : base(ErrorCodes.ValidationError, "Request validation failed.", 422)
    {
        Failures = failures;
    }
}

public class ConflictException : DomainException
{
    public ConflictException(string code, string message)
        : base(code, message, 409) { }
}
