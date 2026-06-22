namespace Trendify.Shared.Responses;

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    string? Cursor,
    bool HasMore,
    int Total
)
{
    public static PagedResult<T> Empty() =>
        new([], null, false, 0);

    public static PagedResult<T> From(IReadOnlyList<T> items, int pageSize, Func<T, string> cursorSelector)
    {
        var hasMore = items.Count > pageSize;
        var trimmed = hasMore ? items.Take(pageSize).ToList() : items.ToList();
        var cursor = hasMore ? cursorSelector(trimmed.Last()) : null;
        return new PagedResult<T>(trimmed, cursor, hasMore, trimmed.Count);
    }
}
