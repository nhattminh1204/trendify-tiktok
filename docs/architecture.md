# Architecture — Trendify

## Overview

Trendify is a **Modular Monolith** deployed as a single Docker application.
Each module owns its own domain logic, database schema subset, and API surface.
Modules communicate exclusively through in-process domain events.

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          Client Layer                              │
│                    Next.js (TypeScript)                            │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ HTTPS / REST
┌──────────────────────────────▼─────────────────────────────────────┐
│                         API Gateway Layer                           │
│              ASP.NET Core 9 — Minimal API / Controllers            │
│       Auth Middleware → Rate Limiting → Request Validation         │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│                         Module Layer                                │
│                                                                     │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Accounts  │ │ Trends   │ │ Audience │ │  Content Brain/      │ │
│  │           │ │          │ │          │ │  Content Factory      │ │
│  └───────────┘ └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌───────────┐ ┌──────────┐ ┌──────────────────────────────────┐  │
│  │ Analytics │ │ Learning │ │           AI Engine              │  │
│  └───────────┘ └──────────┘ └──────────────────────────────────┘  │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│                      Shared Infrastructure                          │
│  DomainEventDispatcher │ CacheService │ StorageService             │
│  AuthService           │ SearchClient │ JobScheduler               │
└────────┬───────────────┬──────────────┬────────────────────────────┘
         │               │              │
    ┌────▼────┐    ┌─────▼────┐   ┌────▼────┐
    │  PostgreSQL │  │  Redis  │   │  MinIO  │
    │  (Primary)  │  │ (Cache) │   │(Storage)│
    └─────────────┘  └─────────┘   └─────────┘
         │                                │
    ┌────▼─────┐                   ┌──────▼────┐
    │Hangfire  │                   │OpenSearch │
    │(Jobs)    │                   │(Search)   │
    └──────────┘                   └───────────┘
```

---

## Module Architecture

### Vertical Slice Structure

Each module follows this internal structure:

```
src/modules/{module-name}/
  Domain/
    {Entity}.cs               — Aggregate roots and entities
    {Module}Errors.cs         — Domain-specific error codes
  Application/
    Commands/
      {Command}.cs            — CQRS command
      {CommandHandler}.cs     — Handler
    Queries/
      {Query}.cs              — CQRS query
      {QueryHandler}.cs       — Handler
    Events/
      {Event}.cs              — Domain event definition
      {EventHandler}.cs       — Cross-module event consumer
  Infrastructure/
    {Module}Repository.cs     — Data access
    {Module}DbConfiguration.cs — EF Core entity config
  API/
    {Module}Endpoints.cs      — Minimal API route registration
    {Module}Controller.cs     — (if using controllers)
    Requests/                 — Request DTOs
    Responses/                — Response DTOs
  README.md                   — Module summary for agents
```

### Module Independence Rules

1. A module's `Application/` layer only depends on `Domain/` within the same module
2. A module's `Infrastructure/` layer only depends on `Application/` within the same module
3. Cross-module dependencies are exclusively via `IDomainEvent` contracts in `src/shared/`
4. No module references another module's namespace

---

## Cross-Module Event Map

Events flow one-way. No circular dependencies.

```
Accounts
  └── AccountCreatedEvent
        → AI Engine: initialize default prompts
        → Audience: create initial profile

TrendIntelligence
  └── TrendDetectedEvent
        → ContentBrain: suggest content angles
        → Learning: record trend context for learning

ContentFactory
  └── ContentPublishedEvent
        → Analytics: begin tracking
        → Learning: record content metadata

Analytics
  └── PerformanceMilestoneReachedEvent
        → Learning: trigger pattern analysis

Learning
  └── ImprovementRecommendationGeneratedEvent
        → ContentBrain: inject recommendation into idea generation
```

---

## Shared Infrastructure

### src/shared/ — Contracts Only (no implementations)

```
src/shared/
  Abstractions/
    ICurrentUser.cs
    IDomainEvent.cs
    ICacheService.cs
    IStorageService.cs
    IJobScheduler.cs
    IAIProvider.cs
  Responses/
    ApiResponse.cs
    ErrorResponse.cs
    PagedResult.cs
  Errors/
    ErrorCodes.cs
    DomainException.cs
  Events/
    DomainEventBase.cs
```

### src/infrastructure/ — Implementations

```
src/infrastructure/
  Persistence/
    AppDbContext.cs
    Migrations/
    Configurations/
  Caching/
    RedisCacheService.cs
    CacheKeys.cs               — All cache key templates
    CacheTTL.cs                — TTL constants
  Messaging/
    MediatREventDispatcher.cs
  Storage/
    MinIOStorageService.cs
  Search/
    OpenSearchClient.cs
  Jobs/
    HangfireJobScheduler.cs
  AI/
    AIProviderRouter.cs        — Cost-aware provider selection
    OpenAIProvider.cs
    AnthropicProvider.cs
    GeminiProvider.cs
    AICostTracker.cs
  Auth/
    JwtService.cs
    PermissionService.cs
```

---

## Multi-Tenancy Model

**Decision:** Row-level isolation with `tenant_id` on all tenant-scoped tables.

See ADR: `docs/decisions/2026-06-20-multi-tenancy-model.md`

### Enforcement

- All queries in repository layer automatically filter by `tenant_id` from `ICurrentUser`
- A base class `TenantRepository<T>` injects `ICurrentUser` and applies the filter
- No query may bypass tenant filtering without an explicit `[BypassTenantFilter]` attribute and code review approval
- `tenant_id` is set at record creation time from `ICurrentUser.TenantId`

### Phase 1 Behavior

In Phase 1 (single user), each user account is its own tenant. No shared data between users.

---

## Caching Strategy

See ADR: `docs/decisions/2026-06-20-caching-strategy.md`

### TTL Tiers

| Tier | TTL | Use Case |
|---|---|---|
| Hot | 60 seconds | Real-time metrics, live trend scores |
| Warm | 10 minutes | Audience profiles, account summaries |
| Cold | 1 hour | AI-generated recommendations, analytics aggregates |
| Frozen | 24 hours | Reference data, platform configurations |

### Cache Invalidation Rules

- Cache keys follow the template: `{module}:{entity}:{id}:{variant}`
- Invalidation is explicit — on write, delete the affected key(s)
- No "invalidate all" patterns — too broad, causes cache storms
- All cache key templates are centralized in `CacheKeys.cs`

---

## AI Provider Routing

See ADR: `docs/decisions/2026-06-20-ai-provider-routing.md`

### Routing Logic

```
Low complexity (classification, tagging, short completion)
  → Gemini Flash or Claude Haiku (cheapest)

Medium complexity (script generation, idea expansion)
  → GPT-4o mini or Claude Sonnet

High complexity (strategy generation, deep analysis)
  → GPT-4o or Claude Opus

Fallback chain: Primary → Secondary → Error (never silent failure)
```

### Cost Tracking

Every AI call records to `ai_usage_logs` table:
- `provider`, `model`, `feature_context`
- `prompt_tokens`, `completion_tokens`, `estimated_cost_usd`
- `tenant_id`, `user_id`, `correlation_id`

---

## Authentication & Authorization

- **Mechanism:** JWT Bearer tokens
- **Token lifespan:** 15 minutes (access), 7 days (refresh)
- **Claims:** `user_id`, `tenant_id`, `roles[]`, `permissions[]`
- **Role model:** `Owner`, `Admin`, `Editor`, `Viewer` (Phase 1: Owner only)
- **API keys:** Supported for programmatic access (Phase 3+)

---

## Background Jobs (Hangfire)

| Job | Schedule | Module |
|---|---|---|
| `TrendScanJob` | Every 15 minutes | Trend Intelligence |
| `AudienceRefreshJob` | Daily at 2 AM | Audience Intelligence |
| `AnalyticsAggregationJob` | Every hour | Analytics |
| `LearningAnalysisJob` | Daily at 3 AM | Learning Engine |
| `ContentPublishJob` | On demand | Content Factory |
| `AIUsageSummaryJob` | Daily at midnight | AI Engine |

---

## Deployment Architecture (Phase 1)

Single Linux VPS with Docker Compose.

```yaml
services:
  api:          # .NET 9 backend
  frontend:     # Next.js
  postgres:     # PostgreSQL 16
  redis:        # Redis 7
  minio:        # MinIO
  opensearch:   # OpenSearch 2
  hangfire:     # Background job server (same .NET process or separate)
```

All services on a private Docker network. Only `api` and `frontend` expose ports.

---

## Observability

- **Logging:** Structured JSON via Serilog, correlation ID on every request
- **Metrics:** Prometheus-compatible via `prometheus-net`
- **Tracing:** OpenTelemetry with Jaeger (Phase 2+)
- **Error tracking:** Self-hosted Seq (log aggregator)
- **Health checks:** `/health` and `/health/ready` endpoints

---

## API Versioning Strategy

- URL path versioning: `/api/v1/`, `/api/v2/`
- Breaking changes require a new version
- Old versions maintained for 1 full release cycle
- Version deprecation announced in response header: `Deprecation: date`
