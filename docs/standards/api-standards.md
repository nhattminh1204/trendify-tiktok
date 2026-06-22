# API Standards — Trendify

## Response Envelope

All API responses must use this envelope. No exceptions.

### Success Response
```csharp
// C# definition in src/shared/Responses/ApiResponse.cs
public class ApiResponse<T>
{
    public T? Data { get; init; }
    public ApiMeta Meta { get; init; }
    public ErrorResponse? Error { get; init; }

    public static ApiResponse<T> Success(T data) => new()
    {
        Data = data,
        Meta = ApiMeta.Now(),
        Error = null
    };

    public static ApiResponse<T> Fail(ErrorResponse error) => new()
    {
        Data = default,
        Meta = ApiMeta.Now(),
        Error = error
    };
}

public record ApiMeta(string RequestId, DateTimeOffset Timestamp, string Version)
{
    public static ApiMeta Now() => new(
        Guid.NewGuid().ToString(),
        DateTimeOffset.UtcNow,
        "1.0"
    );
}
```

### Error Response
```csharp
public class ErrorResponse
{
    public string Code { get; init; }       // e.g. "TREND_NOT_FOUND"
    public string Message { get; init; }    // Human-readable
    public List<ErrorDetail> Details { get; init; } = [];
}

public record ErrorDetail(string Field, string Message);
```

---

## Versioning

- URL path versioning: `/api/v1/`, `/api/v2/`
- Current version: `v1`
- Breaking changes (removed fields, changed types, removed endpoints) require a new version
- Non-breaking additions (new optional fields, new endpoints) do NOT require a new version
- Deprecated versions return header: `Deprecation: Sat, 31 Dec 2026 23:59:59 GMT`
- Old versions supported for 3 months after deprecation announcement

---

## HTTP Status Codes

| Scenario | Status Code |
|---|---|
| Success (with body) | 200 OK |
| Created | 201 Created |
| Success (no body) | 204 No Content |
| Validation failed | 422 Unprocessable Entity |
| Not found | 404 Not Found |
| Unauthorized | 401 Unauthorized |
| Forbidden | 403 Forbidden |
| Rate limited | 429 Too Many Requests |
| Server error | 500 Internal Server Error |
| Upstream error | 502 Bad Gateway |

---

## Pagination

All list endpoints use cursor-based pagination. No offset pagination for collections that may exceed 1,000 records.

### Request
```
GET /api/v1/content/ideas?limit=20&cursor=eyJpZCI6IjE...
```

### Response
```json
{
  "data": {
    "items": [],
    "cursor": "eyJpZCI6IjI...",
    "hasMore": true,
    "total": 450
  }
}
```

### Rules
- Default `limit`: 20
- Maximum `limit`: 100
- `cursor` is opaque — clients must not parse it
- `total` is approximate for large collections (avoid COUNT(*) on every page)

---

## Filtering & Sorting

### Filter convention
```
GET /api/v1/trends?status=active&platform=tiktok&minScore=50
```

### Sort convention
```
GET /api/v1/trends?sort=score&order=desc
```

- `sort`: field name (camelCase)
- `order`: `asc` | `desc` (default: `desc`)
- Multiple sort fields: `sort=score,createdAt&order=desc,asc`

---

## Validation

- Request validation happens at the API boundary using `FluentValidation`
- Invalid requests return `422` with per-field error details:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      { "field": "email", "message": "Email is required." },
      { "field": "password", "message": "Password must be at least 8 characters." }
    ]
  }
}
```

---

## Request IDs

- Every request is assigned a `X-Request-Id` header (generated server-side if not provided)
- The same `requestId` is returned in the response `meta` object
- All logs include this ID for request tracing

---

## Auth Headers

```
Authorization: Bearer <access_token>
```

AI endpoint additional header (for cost attribution):
```
X-Feature-Context: content-brain.script-generation
```

---

## Async Operations

For long-running operations (AI generation, report creation, pipeline runs):
1. POST endpoint returns `202 Accepted` with a `jobId`
2. Client polls `GET /api/v1/{resource}/jobs/{jobId}` for status
3. Status values: `pending`, `running`, `completed`, `failed`
4. On completion, result is available at `GET /api/v1/{resource}/{id}`

---

## CORS Policy

```
Allowed origins: frontend domain (configured per environment)
Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Allowed headers: Authorization, Content-Type, X-Request-Id
```

Never use `AllowAnyOrigin` in production.
