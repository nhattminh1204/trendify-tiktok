# Infrastructure — Implementations

Implements the interfaces defined in src/shared/.
References external libraries (EF Core, Redis, MinIO, MediatR, Serilog, etc.).

Only src/infrastructure references external packages directly.
Modules reference abstractions from src/shared, NOT from here.

## Contents

```
infrastructure/
  Persistence/
    AppDbContext.cs
    Migrations/
    Rollbacks/              — SQL rollback scripts for destructive migrations
    Configurations/         — EF Core entity configurations per module
  Caching/
    RedisCacheService.cs
    CacheKeys.cs            — ALL cache key templates (centralized)
    CacheTTL.cs             — TTL constants (Hot/Warm/Cold/Frozen)
  Messaging/
    MediatREventDispatcher.cs
  Storage/
    MinIOStorageService.cs
  Search/
    OpenSearchClient.cs
  Jobs/
    HangfireJobScheduler.cs
  AI/
    AIProviderRouter.cs     — Tier-based routing with fallback
    AICostCalculator.cs     — Cost estimation per provider/model
    AICostTracker.cs        — Log to ai_usage_logs
    OpenAIProvider.cs
    AnthropicProvider.cs
    GeminiProvider.cs
  Auth/
    JwtService.cs
    CurrentUserService.cs   — Implements ICurrentUser from HttpContext
    PermissionService.cs
  TikTok/
    TikTokApiClient.cs      — All TikTok API calls go here
```
