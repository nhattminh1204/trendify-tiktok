# Observability Standards — Trendify

## Three Pillars

| Pillar | Tool | Phase |
|---|---|---|
| Logs | Serilog → Seq | Phase 1 |
| Metrics | prometheus-net → Grafana | Phase 1 |
| Traces | OpenTelemetry → Jaeger | Phase 2 |

---

## Logging

### Log Format

All logs are structured JSON. Every log entry includes:

```json
{
  "timestamp": "2026-06-20T10:00:00.000Z",
  "level": "Information",
  "message": "Trend scan completed",
  "correlationId": "uuid",
  "tenantId": "uuid",
  "userId": "uuid",
  "module": "trend-intelligence",
  "properties": { }
}
```

### Correlation ID

Every inbound HTTP request is assigned a `correlationId`. It is:
- Generated server-side if not in `X-Request-Id` header
- Attached to all log entries within that request's scope
- Included in all async job executions (passed via job arguments)
- Included in all AI calls (`X-Feature-Context` header)

```csharp
// Middleware injects correlation ID into ILogger scope
using (logger.BeginScope(new { CorrelationId = correlationId, TenantId = tenantId }))
{
    await next(context);
}
```

### Log Levels

| Level | When to Use |
|---|---|
| `Verbose` | Never in production — development tracing only |
| `Debug` | Detailed flow information, disabled in production |
| `Information` | Normal business events (trend detected, idea generated, job completed) |
| `Warning` | Unexpected but recoverable (retry triggered, budget 80% consumed, cache miss rate high) |
| `Error` | Operation failed, action required (AI provider down, database connection failed) |
| `Fatal` | System cannot continue (startup failure, catastrophic error) |

### What NOT to Log

- Passwords, tokens, API keys
- Full request/response bodies (log summaries only)
- PII: email, display names (use IDs instead)
- Full AI prompts (log a hash or prompt ID instead)

### Log Categories

Each module uses its own logger category:
```csharp
ILogger<TrendScanJob>  // category: "Trendify.Workers.TrendScanJob"
ILogger<IdeaGenerationHandler>  // category: "Trendify.Modules.Content.IdeaGenerationHandler"
```

---

## Metrics

### Naming Convention

```
{product}_{module}_{metric_name}_{unit}

Examples:
trendify_trends_detected_total
trendify_ai_tokens_used_total
trendify_content_ideas_generated_total
trendify_api_request_duration_seconds
```

### Required Metrics

| Metric | Type | Labels |
|---|---|---|
| `trendify_api_request_duration_seconds` | Histogram | `method`, `route`, `status_code` |
| `trendify_api_requests_total` | Counter | `method`, `route`, `status_code` |
| `trendify_trends_detected_total` | Counter | `platform`, `status` |
| `trendify_ai_calls_total` | Counter | `provider`, `model`, `feature`, `status` |
| `trendify_ai_tokens_total` | Counter | `provider`, `model`, `feature`, `type` (prompt/completion) |
| `trendify_ai_cost_usd_total` | Counter | `provider`, `model`, `feature` |
| `trendify_content_ideas_generated_total` | Counter | `source` (ai/manual) |
| `trendify_job_duration_seconds` | Histogram | `job_name`, `status` |
| `trendify_active_tenants` | Gauge | — |

---

## Health Checks

Two endpoints required:

### `/health` — Liveness
Returns `200 OK` if the application process is running.
Returns `503` if the application is in a fatal state.

### `/health/ready` — Readiness
Returns `200 OK` only if all dependencies are healthy:
- PostgreSQL: connection test
- Redis: PING test
- MinIO: bucket accessibility test
- Hangfire: scheduler running

```json
{
  "status": "Healthy",
  "checks": {
    "postgres": { "status": "Healthy", "duration": "12ms" },
    "redis":    { "status": "Healthy", "duration": "2ms" },
    "minio":    { "status": "Healthy", "duration": "8ms" },
    "hangfire": { "status": "Healthy", "duration": "1ms" }
  }
}
```

---

## Alerting Thresholds

| Alert | Condition | Severity |
|---|---|---|
| High error rate | `5xx` responses > 1% over 5 min | Critical |
| AI provider down | 3 consecutive failures to any AI provider | High |
| AI budget 80% | Tenant consumes 80% of monthly AI budget | Warning |
| Job failure | Background job fails 3 consecutive runs | High |
| Database slow | p99 query time > 2 seconds | Warning |
| High memory | Container memory > 80% | Warning |
| Disk space | VPS disk > 80% | High |
| TikTok API errors | Error rate > 5% over 10 min | Warning |

---

## Distributed Tracing (Phase 2+)

- OpenTelemetry SDK with automatic instrumentation for ASP.NET Core, EF Core, HttpClient
- Jaeger as the trace backend
- Every AI call creates a child span with: provider, model, feature_context, token counts
- Every database query creates a child span (EF Core instrumentation)
- Sampling rate: 10% in production, 100% for errors

---

## Error Tracking

- Seq as the centralized log aggregator (self-hosted)
- Error alerts via Seq signal definitions
- Every `Error` and `Fatal` log creates a Seq signal event
- Seq accessible at internal network only (not exposed publicly)
