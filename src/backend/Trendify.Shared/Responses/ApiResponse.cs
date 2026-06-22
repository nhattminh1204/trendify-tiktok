namespace Trendify.Shared.Responses;

public sealed class ApiResponse<T>
{
    public T? Data { get; init; }
    public ApiMeta Meta { get; init; } = ApiMeta.Now();
    public ErrorResponse? Error { get; init; }

    public static ApiResponse<T> Ok(T data) => new() { Data = data, Meta = ApiMeta.Now() };

    public static ApiResponse<T> Fail(ErrorResponse error) =>
        new() { Error = error, Meta = ApiMeta.Now() };

    public static ApiResponse<T> Fail(string code, string message) =>
        new() { Error = new ErrorResponse(code, message), Meta = ApiMeta.Now() };
}

public sealed record ApiMeta(string RequestId, DateTimeOffset Timestamp, string Version)
{
    public static ApiMeta Now() => new(
        Guid.NewGuid().ToString("N"),
        DateTimeOffset.UtcNow,
        "1.0"
    );
}
