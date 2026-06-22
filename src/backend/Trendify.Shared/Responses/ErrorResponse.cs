namespace Trendify.Shared.Responses;

public sealed record ErrorResponse(
    string Code,
    string Message,
    IReadOnlyList<ErrorDetail>? Details = null
);

public sealed record ErrorDetail(string Field, string Message);
