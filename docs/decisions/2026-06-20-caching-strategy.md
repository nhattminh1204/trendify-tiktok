# ADR: Caching Strategy

- **Date:** 2026-06-20
- **Status:** Accepted

## Context

Trendify has several types of data with different access patterns:
- Trend feed: read frequently, changes every 15 minutes
- Analytics dashboard: read frequently, updated hourly
- AI recommendations: read frequently, generated daily
- Account profiles: read frequently, updated every 6 hours

Without a caching strategy, every dashboard load hits PostgreSQL, which won't scale past Phase 1 with any meaningful load.

## Decision

Use **cache-aside pattern** with Redis as the cache store. Define explicit TTL tiers per data type.

Cache-aside: application checks cache first, on miss reads from database, writes to cache.

## TTL Tiers

| Tier | TTL | Data Types |
|---|---|---|
| Hot | 60 seconds | Trend feed scores, real-time metrics |
| Warm | 10 minutes | Audience profiles, account summaries, analytics aggregates |
| Cold | 1 hour | AI recommendations, content patterns, personas |
| Frozen | 24 hours | Reference data, plan configurations, prompt templates |

## Cache Key Convention

All cache keys follow: `{module}:{entity}:{id}:{variant}`

Examples:
```
trends:feed:{tenantId}:top50
analytics:overview:{tenantId}:{accountId}:30d
audience:profile:{tenantId}:{socialAccountId}
ai:recommendations:{tenantId}:top3
prompts:content-brain.idea-generation:active
```

All cache key templates are centralized in `src/infrastructure/Caching/CacheKeys.cs`.

## Invalidation Strategy

- **Write-through invalidation**: on any write, explicitly delete affected keys
- No "invalidate all" patterns — too broad, causes cache stampedes
- No background cache refresh — cache-aside only
- Cache miss on a cold start is acceptable — system degrades gracefully without cache

## Alternatives Considered

### Write-through cache
- Cache updated on every write
- Rejected: increases write latency; not needed for our read-heavy workload

### Read-through cache (proxy layer)
- Cache handles reads transparently
- Rejected: more complex to implement; cache-aside is simpler and sufficient

### No caching (PostgreSQL only)
- Simple
- Rejected: analytics dashboard with multiple accounts making multiple aggregate queries will be too slow under any real load

### Memcached
- Simpler than Redis
- Rejected: Redis supports data structures (sorted sets for trend scoring), pub/sub (future), and persistence — better long-term choice

## Consequences

**Made easier:**
- Dashboard response times will be < 100ms for cached data
- PostgreSQL load is dramatically reduced for read-heavy pages
- Redis is already in the stack for session management

**Made harder:**
- Cache invalidation bugs can cause stale data to appear
- Cache key management requires discipline (centralized in CacheKeys.cs mitigates this)
- Testing requires either mocking cache or using a real Redis (Testcontainers)

## Non-Cacheable Data

The following should NEVER be cached:
- Authentication tokens (security risk)
- Payment/billing data
- Audit logs
- Any data modified within the same request that must be immediately consistent
