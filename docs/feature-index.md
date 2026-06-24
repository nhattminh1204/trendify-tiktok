# Feature Index — Trendify

All features tracked here. Update this file whenever a feature changes status.

Status: `Planned` | `In Progress` | `Done` | `Deprecated`

---

## Module: Accounts

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| User registration & login | Done | — | `features/accounts.md` | — |
| JWT authentication + refresh token rotation | Done | — | `features/accounts.md` | — |
| Google OAuth login | Done | — | `features/accounts.md` | — |
| Multi-account management | Done | — | `features/accounts.md` | — |
| Account grouping | Done (domain + DB) | — | `features/accounts.md` | — |
| TikTok OAuth integration (PKCE) | Done | — | `features/accounts.md` | — |
| Role-based permissions | Done (domain) | — | `features/accounts.md` | — |
| Account profile management | Done | — | `features/accounts.md` | — |
| TikTok token refresh job (30-min) | Done | — | `features/accounts.md` | — |
| Logout endpoint | Partial (stub) | — | `features/accounts.md` | — |
| Disconnect social account | Partial (stub) | — | `features/accounts.md` | — |
| Account group API endpoints | Planned | — | `features/accounts.md` | — |

---

## Module: Trend Intelligence

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Trend detection (phase 1: simulated, phase 2: TikTok API ready) | Done | — | `features/trends.md` | — |
| Trend scoring & velocity (composite: 40/25/20/15) | Done | — | `features/trends.md` | — |
| Trend API endpoints (list + detail) | Done | — | `features/trends.md` | — |
| Trend lifecycle events (Detected/Peaked/Declining) | Done | — | `features/trends.md` | — |
| Trend scan recurring job (every 2h, with lifecycle analysis) | Done | — | `features/trends.md` | — |
| Trend tracking (watchlist + notes) | Done | — | `features/trends.md` | — |
| Competitor monitoring (CRUD + scan job every 6h) | Done | — | `features/trends.md` | — |
| Trend lifecycle analysis (auto score decay + status transitions) | Done | — | `features/trends.md` | — |
| Trend alerts (domain events on lifecycle changes) | Done | — | `features/trends.md` | — |

---

## Module: Content Brain

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| AI idea generation (standalone) | Done | — | `features/content.md` | — |
| Hook writing | Done | — | `features/content.md` | — |
| Script generation with duration estimate | Done | — | `features/content.md` | — |
| CTA generation | Done | — | `features/content.md` | — |
| Caption generation | Done | — | `features/content.md` | — |
| Hashtag generation | Done | — | `features/content.md` | — |
| Idea board (Draft/Approved/Ready/In Production/Published) | Done | — | `features/content.md` | — |
| Content idea CRUD API | Done | — | `features/content.md` | — |
| Campaign-driven affiliate idea generation | Planned | — | `features/content.md` | — |
| Queue refill job (keep ≥3 ready ideas) | Planned | — | `features/content.md` | — |
| Prompt injection prevention | Planned | — | `features/content.md` | — |

---

## Module: Content Factory

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Content production pipeline | Planned | — | `features/content.md` | — |
| Voice/audio generation | Planned | — | `features/content.md` | — |
| Subtitle generation | Planned | — | `features/content.md` | — |
| Media asset management | Planned | — | `features/content.md` | — |
| Content scheduling (calendar page exists) | Partial (UI only) | — | `features/content.md` | — |
| Batch content creation | Planned | — | `features/content.md` | — |

---

## Module: Analytics

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Views & engagement tracking | Done | — | `features/analytics.md` | — |
| Post metrics snapshot (append-only) | Done | — | `features/analytics.md` | — |
| Analytics API (post metrics query) | Done | — | `features/analytics.md` | — |
| Analytics sync job (every 3 hours) | Done | — | `features/analytics.md` | — |
| Performance milestone events | Done | — | `features/analytics.md` | — |
| Retention analysis | Planned | — | `features/analytics.md` | — |
| Revenue tracking | Partial (TikTok API limitation) | — | `features/analytics.md` | — |
| Performance benchmarking | Planned | — | `features/analytics.md` | — |
| Multi-account dashboard | Planned | — | `features/analytics.md` | — |
| Export reports | Planned | — | `features/analytics.md` | — |

---

## Module: AI Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Multi-provider routing (OpenAI/Anthropic/Gemini) | Done | — | `features/ai-engine.md` | `2026-06-20-ai-provider-routing.md` |
| AI cost tracking | Done | — | `features/ai-engine.md` | — |
| Token budget enforcement (free: $2, pro: $20, agency: $100) | Done | — | `features/ai-engine.md` | — |
| AI complete endpoint with provider routing | Done | — | `features/ai-engine.md` | — |
| AI budget & usage query APIs | Done | — | `features/ai-engine.md` | — |
| Prompt management & versioning (domain + DB) | Done | — | `features/ai-engine.md` | — |
| Prompt evaluation & scoring | Planned | — | `features/ai-engine.md` | — |
| Workflow orchestration | Planned | — | `features/ai-engine.md` | — |

---

## Module: Audience Intelligence

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Audience profile (demographics, interests, geography) | Done | — | `features/audience.md` | — |
| Audience personas (domain + DB) | Done | — | `features/audience.md` | — |
| Audience API (profile + personas) | Done | — | `features/audience.md` | — |
| Audience sync job (every 6 hours) | Done | — | `features/audience.md` | — |
| Persona AI generation | Planned | — | `features/audience.md` | — |
| Niche discovery | Planned | — | `features/audience.md` | — |
| Monetization opportunity detection | Planned | — | `features/audience.md` | — |
| Audience segmentation | Planned | — | `features/audience.md` | — |

---

## Module: Learning Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Content pattern domain + DB | Done | — | `features/learning.md` | — |
| Improvement recommendation domain + DB | Done | — | `features/learning.md` | — |
| Learning API (patterns, recommendations) | Done | — | `features/learning.md` | — |
| Apply recommendation command | Done | — | `features/learning.md` | — |
| Historical content ingestion | Planned | — | `features/learning.md` | — |
| Winning pattern identification (AI) | Planned | — | `features/learning.md` | — |
| Losing pattern identification (AI) | Planned | — | `features/learning.md` | — |
| Content performance memory | Planned | — | `features/learning.md` | — |

---

## Module: Product Discovery

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Manual product import (affiliate link) | Done | — | `features/products.md` | — |
| Product CRUD API (list, detail, update, delete) | Done | — | `features/products.md` | — |
| Product scoring algorithm (v1: commission-based) | Done | — | `features/products.md` | — |
| Product discovery feed (sorted, filterable, paginated) | Done | — | `features/products.md` | — |
| Watchlist (add/remove/list) | Done | — | `features/products.md` | — |
| Performance metrics (CTR, CVR, commission) — API + DB | Done | — | `features/products.md` | — |
| Product domain events (Added, Delisted, HighOpp) | Done | — | `features/products.md` | — |
| Product endpoints (9 endpoints) | Done | — | `features/products.md` | — |
| TikTok Shop API sync (Phase 2) | Planned | — | `features/products.md` | — |
| Delisted product handling (auto-campaign pause) | Planned | — | `features/products.md` | — |
| ThumbnailCacheJob | Planned | — | `features/products.md` | — |
| ProductSyncJob (Phase 2) | Planned | — | `features/products.md` | — |

---

## Module: Video Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| TTS voice generation (OpenAI) | Planned | — | `features/video-engine.md` | — |
| Subtitle generation & sync | Planned | — | `features/video-engine.md` | — |
| FFmpeg scene composition | Planned | — | `features/video-engine.md` | — |
| Visual template system (3 templates) | Planned | — | `features/video-engine.md` | — |
| Render retry & timeout enforcement | Planned | — | `features/video-engine.md` | — |
| Render job queue & concurrency limits | Planned | — | `features/video-engine.md` | — |
| Auto-cancel on campaign pause/archive | Planned | — | `features/video-engine.md` | — |
| render_type discriminator | Planned | — | `features/video-engine.md` | `2026-06-22-video-pipeline-v2.md` |

---

## Module: AI Model Library

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Browse system models | Planned | — | `features/ai-model-library.md` | — |
| Filter models by gender / style / age | Planned | — | `features/ai-model-library.md` | — |
| Upload custom model (reference images) | Planned | — | `features/ai-model-library.md` | — |
| ModelProcessingJob (face detection + thumbnail) | Planned | — | `features/ai-model-library.md` | — |
| Model selection in video generation flow | Planned | — | `features/ai-model-library.md` | — |
| Tier limits on user-uploaded models | Planned | — | `features/ai-model-library.md` | — |
| Model-in-use guard on delete | Planned | — | `features/ai-model-library.md` | — |

---

## Module: Viral Template Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Template library (minimum 20 at launch) | Planned | — | `features/viral-template-engine.md` | — |
| Product type taxonomy + category mapping | Planned | — | `features/viral-template-engine.md` | — |
| Video style taxonomy | Planned | — | `features/viral-template-engine.md` | — |
| Template filtering by product type | Planned | — | `features/viral-template-engine.md` | — |
| Template analysis JSON schema | Planned | — | `features/viral-template-engine.md` | — |
| Preview clip generation (FFmpeg) | Planned | — | `features/viral-template-engine.md` | — |
| ViralVideoAnalysisJob (automated draft) | Planned | — | `features/viral-template-engine.md` | — |
| Template browse UI with preview-on-hover (UI exists) | Partial (UI only) | — | `features/viral-template-engine.md` | — |

---

## Module: Character Replacement Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| CharacterReplacementJob lifecycle | Planned | — | `features/character-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| Pose extraction via MediaPipe (Python sidecar) | Planned | — | `features/character-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| Kling AI API integration (Phase 1 primary) | Planned | — | `features/character-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| Runway ML API integration (Phase 1 fallback) | Planned | — | `features/character-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| ComfyUI + Wan2.1 integration (Phase 2) | Planned | — | `features/character-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| Quality validation (face visibility ≥ 60%) | Planned | — | `features/character-replacement.md` | — |
| Retry logic (max 2) + 10-minute timeout | Planned | — | `features/character-replacement.md` | — |
| Pose data cleanup job (7-day retention) | Planned | — | `features/character-replacement.md` | — |
| ICharacterReplacementProvider interface | Planned | — | `features/character-replacement.md` | — |

---

## Module: Product Replacement Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| ProductReplacementJob lifecycle | Planned | — | `features/product-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| Object detection via GroundingDINO (Replicate) | Planned | — | `features/product-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| Video segmentation via SAM2 (Replicate) | Planned | — | `features/product-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| Background inpainting via Stability AI | Planned | — | `features/product-replacement.md` | `2026-06-22-open-source-ai-stack.md` |
| Product compositing (FFmpeg + OpenCV) | Planned | — | `features/product-replacement.md` | — |
| Detection prompt by product type | Planned | — | `features/product-replacement.md` | — |
| PRODUCT_NOT_DETECTABLE handling (no retry) | Planned | — | `features/product-replacement.md` | — |
| Quality validation (composited frames ≥ 70%) | Planned | — | `features/product-replacement.md` | — |
| Retry logic (max 2) + 15-minute timeout | Planned | — | `features/product-replacement.md` | — |
| IObjectDetectionProvider / ISegmentationProvider / IInpaintingProvider | Planned | — | `features/product-replacement.md` | — |
| Self-hosted Phase 2: GroundingDINO + SAM2 + FLUX | Planned | — | `features/product-replacement.md` | `2026-06-22-open-source-ai-stack.md` |

---

## Module: Publishing Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Publish job scheduling (slot algorithm) | Planned | — | `features/publishing-engine.md` | — |
| TikTok chunked video upload | Planned | — | `features/publishing-engine.md` | — |
| Daily rate limit enforcement (10/account/day) | Planned | — | `features/publishing-engine.md` | — |
| Retry logic (transient vs non-retriable errors) | Planned | — | `features/publishing-engine.md` | — |
| Campaign pause/resume job management | Planned | — | `features/publishing-engine.md` | — |
| Token expiry detection & hold | Planned | — | `features/publishing-engine.md` | — |
| Account publishing schedule view | Planned | — | `features/publishing-engine.md` | — |

---

## Module: Campaign

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Campaign CRUD (draft/active/paused/completed) | Planned | — | `features/campaigns.md` | — |
| Campaign activation & lifecycle actions | Planned | — | `features/campaigns.md` | — |
| Tier limit enforcement | Planned | — | `features/campaigns.md` | — |
| Auto-pause on delisted product | Planned | — | `features/campaigns.md` | — |
| Campaign metrics rollup (nightly) | Planned | — | `features/campaigns.md` | — |
| Video progress counters | Planned | — | `features/campaigns.md` | — |

---

## Shared Infrastructure

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Standard API response envelope (`ApiResponse<T>`) | Done | — | `standards/api-standards.md` | — |
| Error response + domain exceptions | Done | — | `standards/api-standards.md` | — |
| JWT auth (token generation + validation) | Done | — | `standards/security-standards.md` | — |
| CurrentUser service (from HttpContext) | Done | — | `standards/security-standards.md` | — |
| Token encryption (AES-256-GCM) | Done | — | `standards/security-standards.md` | — |
| Correlation ID middleware | Done | — | `standards/observability-standards.md` | — |
| Global exception handling middleware | Done | — | `standards/api-standards.md` | — |
| MediatR pipeline (logging, validation, perf, exception) | Done | — | `standards/observability-standards.md` | — |
| Domain event dispatcher (in-memory + outbox) | Done | — | `architecture.md` | `2026-06-20-inter-module-communication.md` |
| Outbox processor (recurring job, every 10s) | Done | — | `architecture.md` | — |
| Redis cache service | Done | — | `standards/` | `2026-06-20-caching-strategy.md` |
| MinIO storage service | Done | — | `standards/` | — |
| TikTok API client (videos + user stats) | Done | — | `standards/` | — |
| Tenant entity base class (soft-delete, timestamps) | Done | — | `architecture.md` | `2026-06-20-multi-tenancy-model.md` |
| EF Core DbContext + module assembly scanning | Done | — | `architecture.md` | — |
| Rate limiting middleware | Planned | — | `standards/api-standards.md` | — |
| Structured logging (Serilog) | Planned | — | `standards/observability-standards.md` | — |
| Tenant filter middleware | Planned | — | `architecture.md` | `2026-06-20-multi-tenancy-model.md` |

---

## Known Gaps (code exists but incomplete)

| Gap | Module | Impact |
|---|---|---|
| No account group API endpoints | Accounts | Cannot manage groups via API |
| No domain event handlers exist (events defined but no consumers) | All | Cross-module communication not wired |
| AIPrompt templates defined but unused by consumers | AIEngine | Prompts still hardcoded in Content module |
| No persona AI generation pipeline | Audience | Personas have domain + DB but no data |
| No pattern analysis pipeline | Learning | Patterns have domain + DB but no ML/AI |
| No recommendation generator | Learning | Recommendations exist but no generation |
| Save/watchtime/revenue shown as 0 | Analytics | TikTok basic API doesn't expose these |
| Demo/stub data in audience sync demographics | Audience | No real TikTok audience data yet |
| ProductSyncJob not implemented (Phase 2) | Products | Metrics population is manual only |
| ThumbnailCacheJob not implemented | Products | Thumbnails stored as-origin URL |
