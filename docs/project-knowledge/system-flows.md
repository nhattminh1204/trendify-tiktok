# System Flows — Trendify

## Flow 1: Request Lifecycle (mọi API call)

```
Client (Next.js)
    │  HTTPS/REST
    ▼
ASP.NET Core API Gateway
    ├── JWT Auth Middleware (validate Bearer token, extract claims)
    ├── Tenant Filter Middleware (inject tenant_id từ claims)
    ├── Rate Limiting Middleware
    └── Request Validation (FluentValidation at boundary)
    │
    ▼
Module Handler (CQRS Command/Query)
    ├── Business logic
    ├── Repository (auto-filter by tenant_id)
    └── Publish Domain Events (via MediatR)
    │
    ▼
Response: ApiResponse<T> envelope
```

**tenant_id KHÔNG bao giờ được nhận từ request body** — luôn từ JWT claims.

---

## Flow 2: Cross-Module Communication (Domain Events)

```
Module A (Publisher)                    Module B (Consumer)
     │                                        │
     │  await _dispatcher.Publish(event)      │
     │ ─────────────────────────────────────► │
     │                                        ▼
     │                             INotificationHandler<TEvent>
     │                                  (xử lý async)
```

**In-process** — không phải message queue. MediatR làm event bus nội bộ.

**Toàn bộ Event Map:**
```
Accounts
  AccountCreatedEvent → AI Engine (init default prompts)
                      → Audience (create initial profile)
  SocialAccountConnectedEvent → Analytics (begin tracking)
                              → Audience (begin analysis)
  SocialAccountDisconnectedEvent → Analytics (stop sync)
  TokenExpiredEvent → [user notification]

TrendIntelligence
  TrendDetectedEvent (score > 70) → Content Brain (suggest content angles)

ContentBrain
  ContentIdeaPublishedEvent → Analytics (begin tracking)
                            → Learning (record idea metadata)

Analytics
  PerformanceMilestoneReachedEvent → Learning (trigger pattern analysis)
  LowPerformanceDetectedEvent → Learning (record negative signal)

Learning
  ImprovementRecommendationGeneratedEvent → Content Brain (inject into AI context)
```

---

## Flow 3: AI Call Lifecycle

```
Module (e.g., Content Brain)
    │
    │  1. await _budgetService.CheckBudgetAsync(tenantId, featureContext)
    │     → IF exceeded → throw AIBudgetExceededException → 429
    │     → IF warning → continue with warning flag
    │
    │  2. await _aiEngine.ExecuteAsync(promptSlug, variables)
    │
    ▼
AI Engine
    ├── Load prompt by slug from DB (active version only)
    ├── Validate all required variables present
    ├── Determine routing tier from featureContext
    │     Micro: gemini-flash-1.5 (fallback: claude-haiku-4-5)
    │     Standard: gpt-4o-mini (fallback: claude-sonnet-4-6)
    │     Premium: gpt-4o (fallback: claude-opus-4-8)
    ├── Call primary provider
    │     → IF fail → call fallback provider
    │     → IF both fail → throw AIProviderUnavailableException
    ├── Log to ai_usage_logs (provider, model, tokens, cost, feature, tenant, user)
    └── Return result to calling module
```

**Invariant:** Failed calls log with `status = failed` nhưng KHÔNG tính vào budget.

---

## Flow 4: TrendScanJob (Every 15 minutes)

```
Hangfire triggers TrendScanJob
    │
    ├── For each tenant with active social accounts:
    │   ├── Fetch trending hashtags from TikTok API (per account's niche)
    │   ├── For each trend:
    │   │   ├── Calculate score (velocity×0.4 + volume×0.25 + engagement×0.2 + recency×0.15)
    │   │   ├── Upsert trend_detections record
    │   │   └── Update status (rising → peaking → declining → dead)
    │   └── IF new trend AND score > 70:
    │       └── Publish TrendDetectedEvent
    │             → ContentBrain handler: queue "suggest angles" task
    │
    └── CompetitorScanJob (every 6h):
        ├── Fetch recent posts from competitor profiles
        ├── Extract keywords
        └── Feed into trend detection pipeline
```

---

## Flow 5: AnalyticsAggregationJob (Every hour)

```
Hangfire triggers AnalyticsAggregationJob
    │
    ├── Determine which posts need refresh:
    │   ├── Posts < 30 days old: refresh every hour
    │   ├── Posts 30–90 days old: refresh daily
    │   └── Posts > 90 days old: refresh weekly
    │
    ├── For each post needing refresh:
    │   ├── Call TikTok API (video.list scope)
    │   ├── INSERT new post_metrics row (NEVER UPDATE)
    │   ├── Check for performance milestones:
    │   │   └── IF views hit 10k/100k/1M → publish PerformanceMilestoneReachedEvent
    │   └── IF views < 100 after 24h → publish LowPerformanceDetectedEvent
    │
    └── Invalidate Redis cache (dashboard aggregates)
```

---

## Flow 6: LearningAnalysisJob (Daily 3 AM)

```
Hangfire triggers LearningAnalysisJob
    │
    ├── Check: does tenant have ≥ 10 posts with metrics? IF NOT: skip
    │
    ├── Fetch all content_posts + latest post_metrics + related content_ideas
    │
    ├── Pattern Detection (statistical, NOT AI):
    │   ├── Segment posts by: niche, hook_type, script_length, posting_hour, cta_type
    │   ├── Calculate avg metrics per segment vs. account baseline
    │   ├── Segments > 50% above baseline → candidate winning pattern
    │   └── Segments > 30% below baseline → candidate losing pattern
    │
    ├── AI call (Premium tier): generate human-readable description for each pattern
    │
    ├── Upsert content_patterns (increment evidence_count if pattern exists)
    │
    ├── Generate ImprovementRecommendations from high-confidence patterns (≥50%)
    │
    └── Publish ImprovementRecommendationGeneratedEvent
          → ContentBrain: update AI context for next idea generation
```

---

## Flow 7: Content Pipeline Execution

```
User triggers POST /factory/pipelines/{id}/run
    │
    ├── Check: no other run active for this idea (409 if so)
    ├── Create ContentPipelineRun record (status: pending)
    ├── Enqueue Hangfire job: ContentPipelineJob
    └── Return run ID to user

ContentPipelineJob (background):
    ├── Mark run: running
    ├── For each step in pipeline.steps (sequential):
    │   ├── step.type = "voice_generation":
    │   │   └── Call IVoiceProvider (ElevenLabs) → save audio → create ContentAsset
    │   ├── step.type = "subtitle_generation":
    │   │   └── Call ISubtitleProvider (Whisper API) → save SRT → create ContentAsset
    │   └── step.type = "notify_complete":
    │       └── Send user notification
    │
    ├── IF any step fails:
    │   ├── Mark run: failed, log error_message
    │   ├── Notify user
    │   └── STOP (no auto-retry)
    │
    └── Mark run: completed → Publish PipelineRunCompletedEvent
```

---

## Flow 8: Authentication

```
POST /auth/register → Create Workspace + User → Return JWT pair
POST /auth/login → Validate credentials → Return JWT pair

JWT Structure:
  Header: RS256
  Payload: { user_id, tenant_id, roles[], permissions[], exp }
  Access token: 15 min TTL
  Refresh token: 7 days TTL

POST /auth/refresh → Validate refresh token → Return new access token

All protected endpoints:
  1. Extract Bearer token
  2. Validate signature + expiry
  3. Extract claims → inject ICurrentUser
  4. All subsequent code uses ICurrentUser (never trusts request body for identity)
```

---

## Caching Strategy

```
Cache key pattern: {module}:{entity}:{id}:{variant}
Examples:
  trends:feed:tenant-uuid:hot           TTL: 60s  (Hot tier)
  audience:profile:account-uuid         TTL: 10m  (Warm tier)
  content:recommendations:tenant-uuid   TTL: 1h   (Cold tier)
  reference:tiktok-categories           TTL: 24h  (Frozen tier)

Cache invalidation: explicit delete on write
NO "invalidate all" — tránh cache storms
All cache keys centralized in CacheKeys.cs
```

---

## Multi-Tenancy Enforcement

```
Mọi query đều được filter tự động:
  TenantRepository<T> : BaseRepository<T>
  {
      protected ICurrentUser _currentUser;
      // Mọi query tự động thêm WHERE tenant_id = _currentUser.TenantId
  }

Bypass: cần explicit [BypassTenantFilter] attribute + code review approval
tenant_id KHÔNG bao giờ nhận từ HTTP body — luôn từ ICurrentUser.TenantId
```
