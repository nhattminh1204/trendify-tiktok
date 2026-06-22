# Feature Index — Trendify

All features tracked here. Update this file whenever a feature changes status.

Status: `Planned` | `In Progress` | `Done` | `Deprecated`

---

## Module: Product Discovery

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Manual product import (affiliate link) | Planned | — | `features/products.md` | — |
| Product discovery feed | Planned | — | `features/products.md` | — |
| Product scoring algorithm | Planned | — | `features/products.md` | — |
| Watchlist | Planned | — | `features/products.md` | — |
| Performance metrics (CTR, CVR, commission) | Planned | — | `features/products.md` | — |
| TikTok Shop API sync (Phase 2) | Planned | — | `features/products.md` | — |
| Delisted product handling | Planned | — | `features/products.md` | — |

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
| render_type discriminator (text_to_video / viral_template) | Planned | — | `features/video-engine.md` | `2026-06-22-video-pipeline-v2.md` |

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
| Template browse UI with preview-on-hover | Planned | — | `features/viral-template-engine.md` | — |

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
| IObjectDetectionProvider / ISegmentationProvider / IInpaintingProvider interfaces | Planned | — | `features/product-replacement.md` | — |
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

## Module: Accounts

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| User registration & login | Planned | — | `features/accounts.md` | — |
| JWT authentication | Planned | — | `features/accounts.md` | — |
| Multi-account management | Planned | — | `features/accounts.md` | — |
| Account grouping | Planned | — | `features/accounts.md` | — |
| TikTok OAuth integration | Planned | — | `features/accounts.md` | — |
| Role-based permissions | Planned | — | `features/accounts.md` | — |
| Account profile management | Planned | — | `features/accounts.md` | — |

---

## Module: Audience Intelligence

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Audience demographic analysis | Planned | — | `features/audience.md` | — |
| Persona generation | Planned | — | `features/audience.md` | — |
| Niche discovery | Planned | — | `features/audience.md` | — |
| Monetization opportunity detection | Planned | — | `features/audience.md` | — |
| Audience segmentation | Planned | — | `features/audience.md` | — |

---

## Module: Trend Intelligence

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Trend detection (TikTok API) | Planned | — | `features/trends.md` | — |
| Trend scoring & velocity | Planned | — | `features/trends.md` | — |
| Trend tracking (watchlist) | Planned | — | `features/trends.md` | — |
| Competitor monitoring | Planned | — | `features/trends.md` | — |
| Trend lifecycle analysis | Planned | — | `features/trends.md` | — |
| Trend alerts | Planned | — | `features/trends.md` | — |

---

## Module: Content Brain

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| AI idea generation (standalone) | Planned | — | `features/content.md` | — |
| Hook writing | Planned | — | `features/content.md` | — |
| Script generation with duration estimate | Planned | — | `features/content.md` | — |
| CTA generation | Planned | — | `features/content.md` | — |
| Campaign-driven affiliate idea generation | Planned | — | `features/content.md` | — |
| Caption generation (auto on approve) | Planned | — | `features/content.md` | — |
| Hashtag generation (trending + niche) | Planned | — | `features/content.md` | — |
| Queue refill job (keep ≥3 ready ideas) | Planned | — | `features/content.md` | — |
| Prompt injection prevention | Planned | — | `features/content.md` | — |
| Idea board (Draft/Approved/Ready/In Production/Published) | Planned | — | `features/content.md` | — |

---

## Module: Content Factory

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Content production pipeline | Planned | — | `features/content.md` | — |
| Voice/audio generation | Planned | — | `features/content.md` | — |
| Subtitle generation | Planned | — | `features/content.md` | — |
| Media asset management | Planned | — | `features/content.md` | — |
| Content scheduling | Planned | — | `features/content.md` | — |
| Batch content creation | Planned | — | `features/content.md` | — |

---

## Module: Analytics

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Views & engagement tracking | Planned | — | `features/analytics.md` | — |
| Retention analysis | Planned | — | `features/analytics.md` | — |
| Revenue tracking | Planned | — | `features/analytics.md` | — |
| Performance benchmarking | Planned | — | `features/analytics.md` | — |
| Multi-account dashboard | Planned | — | `features/analytics.md` | — |
| Export reports | Planned | — | `features/analytics.md` | — |

---

## Module: Learning Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Historical content ingestion | Planned | — | `features/learning.md` | — |
| Winning pattern identification | Planned | — | `features/learning.md` | — |
| Losing pattern identification | Planned | — | `features/learning.md` | — |
| Improvement recommendations | Planned | — | `features/learning.md` | — |
| Content performance memory | Planned | — | `features/learning.md` | — |

---

## Module: AI Engine

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Prompt management & versioning | Planned | — | `features/ai-engine.md` | — |
| Multi-provider routing | Planned | — | `features/ai-engine.md` | `2026-06-20-ai-provider-routing.md` |
| Prompt evaluation & scoring | Planned | — | `features/ai-engine.md` | — |
| AI cost tracking | Planned | — | `features/ai-engine.md` | — |
| Token budget enforcement | Planned | — | `features/ai-engine.md` | — |
| Workflow orchestration | Planned | — | `features/ai-engine.md` | — |

---

## Shared Infrastructure

| Feature | Status | Sprint | Doc | ADR |
|---|---|---|---|---|
| Standard API response envelope | Planned | — | `standards/api-standards.md` | — |
| JWT auth middleware | Planned | — | `standards/security-standards.md` | — |
| Rate limiting middleware | Planned | — | `standards/api-standards.md` | — |
| Structured logging (Serilog) | Planned | — | `standards/observability-standards.md` | — |
| Domain event dispatcher | Planned | — | `architecture.md` | `2026-06-20-inter-module-communication.md` |
| Tenant filter middleware | Planned | — | `architecture.md` | `2026-06-20-multi-tenancy-model.md` |
| Cache service (Redis) | Planned | — | `standards/` | `2026-06-20-caching-strategy.md` |
| Background jobs (Hangfire) | Planned | — | `architecture.md` | — |
