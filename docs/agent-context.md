# Agent Context — Trendify

This file is the entry point for every AI agent working on this project.
Read this file first. Then read only what you need.

---

## How to Navigate This Project

### Step 1 — Read this file completely
Understand the module map, naming conventions, and what NOT to do.

### Step 2 — Read `docs/feature-index.md`
Find the feature you are working on and its status.

### Step 3 — Read the target feature doc
`docs/features/<module>.md` — This has everything: schema, APIs, business rules, acceptance criteria.

### Step 4 — Read only the code files relevant to your task
Do NOT scan the entire `/src` directory.

---

## Module Map

| Module | Directory | Feature Doc | Status |
|---|---|---|---|
| Accounts | `src/modules/accounts` | `docs/features/accounts.md` | Planned |
| Audience Intelligence | `src/modules/audience` | `docs/features/audience.md` | Planned |
| Trend Intelligence | `src/modules/trends` | `docs/features/trends.md` | Planned |
| Content Brain | `src/modules/content` | `docs/features/content.md` | Planned |
| Content Factory | `src/modules/content` | `docs/features/content.md` | Planned |
| Analytics | `src/modules/analytics` | `docs/features/analytics.md` | Planned |
| Learning Engine | `src/modules/learning` | `docs/features/learning.md` | Planned |
| AI Engine | `src/modules/ai-engine` | `docs/features/ai-engine.md` | Planned |
| Product Discovery | `src/modules/products` | `docs/features/products.md` | Planned |
| Campaign | `src/modules/campaigns` | `docs/features/campaigns.md` | Planned |
| Video Engine | `src/modules/video-engine` | `docs/features/video-engine.md` | Planned |
| Publishing Engine | `src/modules/publishing` | `docs/features/publishing-engine.md` | Planned |
| AI Model Library | `src/modules/ai-model-library` | `docs/features/ai-model-library.md` | Planned |
| Viral Template Engine | `src/modules/viral-templates` | `docs/features/viral-template-engine.md` | Planned |
| Character Replacement Engine | `src/modules/character-replacement` | `docs/features/character-replacement.md` | Planned |
| Product Replacement Engine | `src/modules/product-replacement` | `docs/features/product-replacement.md` | Planned |

---

## Shared Infrastructure

Located in `src/shared/` and `src/infrastructure/`.

### Contracts (src/shared/)
These interfaces must be used by all modules — do not create module-specific versions:

- `ICurrentUser` — current authenticated user identity
- `IDomainEvent` — base type for all inter-module events
- `ApiResponse<T>` — standard API response envelope
- `ErrorResponse` — standard error shape
- `PagedResult<T>` — standard pagination result
- `ICachePolicy` — cache key and TTL contract

### Infrastructure Implementations (src/infrastructure/)
- `PostgreSqlContext` — EF Core DbContext (all module DbSets registered here)
- `RedisCache` — cache implementation
- `DomainEventDispatcher` — in-process event bus (MediatR)
- `HangfireJobScheduler` — background job scheduling
- `MinIOStorage` — file storage
- `OpenSearchClient` — search client

### AI Worker Sidecar (Docker: ai-worker)
A Python service exposing REST endpoints on the internal Docker network only.
- `POST /pose-extract` — MediaPipe Pose, extracts keypoints from video
- `POST /face-detect` — MediaPipe FaceDetection, validates model reference images
- `POST /bpm-detect` — aubio, detects BPM from audio file
Providers: `mediapipe`, `aubio`, `opencv-python-headless`, `flask`
Do NOT add GPU-dependent libraries to this container in Phase 1.

### Hangfire Queues
In addition to the default queue, these dedicated queues exist:
- `character-replacement` — CharacterReplacementWorker (concurrency per workspace tier)
- `product-replacement` — ProductReplacementWorker (concurrency per workspace tier)
- `video-render` — VideoRenderWorker (existing)

---

## Naming Conventions

### Database Tables
- Snake case: `trend_detections`, `content_ideas`
- Always include: `id UUID`, `tenant_id UUID`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`
- Soft delete: `deleted_at TIMESTAMPTZ NULL`
- Never use `int` for primary keys — always `UUID`

### API Endpoints
- REST, lowercase, hyphenated: `/api/v1/trend-intelligence/trends`
- Module prefix: `/api/v1/{module-slug}/{resource}`
- All responses use `ApiResponse<T>` envelope

### Domain Events
- Past tense, descriptive: `TrendDetectedEvent`, `ContentIdeaGeneratedEvent`
- Located in: `src/modules/{module}/Events/`

### Background Jobs
- Suffix with `Job`: `TrendScanJob`, `AudienceAnalysisJob`
- Located in: `src/workers/`

---

## Cross-Module Communication Rules

Modules NEVER import each other's types directly.

When Module A needs to trigger behavior in Module B:
1. Module A publishes a `IDomainEvent` via `DomainEventDispatcher`
2. Module B registers an `INotificationHandler<TEvent>` for that event
3. No direct service call between modules

Current cross-module event map: see `docs/architecture.md#event-map`

---

## AI Agent Constraints

- Do NOT read more than 3 files at once unless explicitly needed
- Do NOT generate code without a spec existing in `docs/features/`
- Do NOT create new shared types without checking `src/shared/` first
- Do NOT add new database tables without updating `docs/database-map.md`
- Do NOT add new endpoints without updating `docs/api-map.md`
- Every AI call in code must include cost tracking — see `docs/standards/ai-cost-standards.md`

---

## Key Business Rules (Global)

1. A `tenant_id` is always scoped to the current authenticated user's workspace
2. Free tier users have AI token budget limits enforced by the AI Engine
3. All external API calls (TikTok, AI providers) are wrapped in retry + circuit breaker
4. Trend data older than 90 days is archived to cold storage
5. Content assets (video, audio) are stored in MinIO, never in PostgreSQL

---

## Environment Variables (Required)

See `.env.example` at project root for the full list.
Critical variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `MINIO_*` — Storage configuration
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`

---

## What This Project Is NOT

- Not a microservices system (until Phase 3+ justifies it)
- Not a monolithic big-ball-of-mud (modules are strictly bounded)
- Not a real-time streaming platform (webhooks and polling are sufficient for Phase 1-2)
- Not a video editing tool (Content Factory orchestrates external tools, not build them)
