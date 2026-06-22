# Trendify — System Discovery Document

> **Mục đích:** Mô tả chính xác những gì đang tồn tại trong hệ thống.  
> **Phương pháp:** Đọc trực tiếp toàn bộ codebase, docs, schema, API map.  
> **Nguyên tắc:** Không suy đoán. Không đề xuất. Chỉ mô tả những gì có trong code.  
> **Phân tích ngày:** 2026-06-22

---

## Mục lục

1. [Tổng quan sản phẩm](#1-tổng-quan-sản-phẩm)
2. [User Roles](#2-user-roles)
3. [User Journey](#3-user-journey)
4. [Screen Inventory](#4-screen-inventory)
5. [Feature Inventory](#5-feature-inventory)
6. [User Flow](#6-user-flow)
7. [System Flow](#7-system-flow)
8. [Automation Flow](#8-automation-flow)
9. [Background Jobs](#9-background-jobs)
10. [Database Domain Overview](#10-database-domain-overview)
11. [API Overview](#11-api-overview)
12. [Event & Workflow Map](#12-event--workflow-map)
13. [Current Product Capabilities](#13-current-product-capabilities)
14. [End-to-End Workflow](#14-end-to-end-workflow)

---

## 1. Tổng quan sản phẩm

### Hệ thống này dùng để làm gì

**Trendify** là một **AI-Powered Creator Operating System** (nguồn: `docs/system-overview.md`).

> "Trendify is an AI-Powered Creator Operating System that helps TikTok content creators discover trends, understand their audience, create AI-assisted content, and track performance — all in one platform."

### 7 Module chính

| Module | Mục đích |
|---|---|
| **Accounts** | User, workspace, TikTok OAuth, account groups |
| **Trend Intelligence** | Phát hiện trend, tính điểm, theo dõi lifecycle |
| **Audience Intelligence** | Phân tích demographics, tạo persona bằng AI |
| **Content Brain** | Tạo ý tưởng, hook, script bằng AI |
| **Content Factory** | Pipeline sản xuất: voiceover, subtitle, assets |
| **Analytics** | Metrics bài đăng, doanh thu, benchmarking |
| **Learning Engine** | Phát hiện pattern, gợi ý cải thiện |

Module **AI Engine** là hạ tầng dùng chung cho tất cả modules trên để gọi AI.

### Roadmap theo phases (nguồn: `docs/system-overview.md`)

| Phase | Mục tiêu | Trạng thái |
|---|---|---|
| Phase 1 | 1 user / 10 TikTok accounts, full feature set, 1 workspace | Đang triển khai |
| Phase 2 | Multi-user workspace, team collaboration, invite members | Chưa triển khai |
| Phase 3 | Multi-workspace / Agency tier | Chưa triển khai |
| Phase 4 | Enterprise, API access, advanced attribution | Chưa triển khai |

### Những gì không tìm thấy trong codebase

- Không có user research docs, target market segmentation, pricing strategy, competitor analysis.

---

## 2. User Roles

### Role được định nghĩa trong database

Column `role VARCHAR(50) NOT NULL DEFAULT 'owner'` trong bảng `users`. Không có bảng roles riêng, không có RBAC table.

| Role | Nguồn | Mô tả | Trạng thái |
|---|---|---|---|
| `owner` | `users.role DEFAULT 'owner'` | Người tạo workspace, role duy nhất có trong schema | **Active** |
| `admin` | `ICurrentUser.Role` interface | Xuất hiện trong interface nhưng không có giá trị cụ thể | Implied only |
| `member` | `docs/features/accounts.md` | Team member — đề cập trong docs Phase 2 | Phase 2 |
| `viewer` | `docs/features/accounts.md` | Read-only — đề cập trong docs | Phase 2 |

### Claims trong JWT (nguồn: `JwtService.cs`)

- Claims: `user_id`, `tenant_id`, `roles[]`, `permissions[]`
- AccessToken TTL: **15 phút**
- RefreshToken TTL: **7 ngày**

### Những gì không tìm thấy

Guest role, Agency role, Enterprise role, Super Admin — không có trong Phase 1. Endpoint `POST /accounts/users/invite` được đánh dấu Phase 2.

---

## 3. User Journey

### Bước 1 — Đăng ký

```
User truy cập /register
  → Điền email, password, display name → Submit
  → POST /api/v1/auth/register → RegisterWorkspaceHandler
  → Tạo Workspace (slug auto-generated) + User (role='owner')
  → JWT access token + refresh token
  → Redirect /onboarding
```

### Bước 2 — Đăng nhập

```
User truy cập /login
  → Điền email, password → Submit
  → POST /api/v1/auth/login → LoginHandler
  → Verify password (bcrypt), cập nhật last_login_at
  → JWT (15 phút) + RefreshToken (7 ngày)
  → Zustand store lưu tokens vào localStorage
  → Redirect /dashboard
```

### Bước 3 — Onboarding

```
/onboarding — wizard 4 bước:
  Bước 1: Welcome screen
  Bước 2: Connect TikTok (OAuth, có thể skip)
  Bước 3: Chọn niche (8 cards)
  Bước 4: Done → /dashboard
```

> **Lưu ý:** Onboarding UI tồn tại tại `src/frontend/src/app/onboarding/page.tsx`. Không tìm thấy backend endpoint riêng cho onboarding state — có thể là frontend-only flow.

### Bước 4 — Kết nối TikTok

```
Entry: /onboarding Bước 2 HOẶC /settings/accounts
  → User click "Connect" → Redirect TikTok OAuth (PKCE)
  → POST /api/v1/accounts/social → ConnectTikTokHandler
  → TikTokOAuthService.cs xử lý PKCE
  → Lưu tokens (AES-256 encrypted) → social_accounts
  → Dispatch SocialAccountConnectedEvent
  → Callback: /auth/tiktok/callback
  → Background: TikTokTokenRefreshJob tự refresh mỗi 30 phút
```

### Bước 5 — Sử dụng tính năng

```
/dashboard/trends → Filter niche → Click trend → Detail
  → "Generate content idea" → /dashboard/content/generate

/dashboard/content/generate → AI tạo script
  → /dashboard/content/[id] (Step 1: Script)
  → /dashboard/content/[id]/media (Step 2: Media/Voiceover)
  → /dashboard/content/[id]/caption (Step 3: Caption/Hashtags)
  → /dashboard/content/[id]/publish (Step 4: Schedule/Publish)
```

### Bước 6 — Xem kết quả

```
/dashboard/analytics → KPIs, Top Posts, Revenue
  → [Background] AnalyticsSyncJob cập nhật mỗi 3 giờ

/dashboard/learning → Winning/Losing patterns, Recommendations
  → Apply / Dismiss recommendations
```

---

## 4. Screen Inventory

### Auth / Public (6 screens)

| Màn hình | Route | Mục đích | User Actions |
|---|---|---|---|
| Root Redirect | `/` | Auto-redirect | → /dashboard |
| Login | `/login` | Đăng nhập | Submit, link → /register |
| Register | `/register` | Tạo workspace | Submit, link → /login |
| Pricing | `/pricing` | So sánh plans | Click plan → /register |
| Onboarding | `/onboarding` | Setup wizard 4 bước | Next, Skip, Connect TikTok |
| TikTok Callback | `/auth/tiktok/callback` | OAuth handler | Auto-process |

### Dashboard (10 screens, require auth)

| Màn hình | Route | Thành phần chính | User Actions |
|---|---|---|---|
| Dashboard Overview | `/dashboard` | Quick stats, AI Budget bar, Trending Now feed | Click trend → detail |
| Trends List | `/dashboard/trends` | Niche pills, Sort dropdown, Status filter, Trend cards | Filter, sort, click |
| Trend Detail | `/dashboard/trends/[id]` | Lifecycle, score history, competitor data | Watchlist, Generate idea |
| Content List | `/dashboard/content` | Tabs (All/Draft/Approved/…), Idea cards | New Idea, AI Generate |
| AI Script Generator | `/dashboard/content/generate` | Brief form (left) + Script output (right) | Generate, Regenerate, Save |
| Content Detail (Step 1) | `/dashboard/content/[id]` | Stepper, Hook, Script, Hashtags, AI Suggestions | Edit, Approve, → /media |
| Media (Step 2) | `/dashboard/content/[id]/media` | Video upload, Voiceover AI, Background music | Upload, Generate, Preview |
| Caption (Step 3) | `/dashboard/content/[id]/caption` | Caption editor, Hashtag manager, TikTok toggles | Edit, Add tags, → /publish |
| Publish (Step 4) | `/dashboard/content/[id]/publish` | Account selector, AI best-time, TikTok preview | Select slot, Schedule/Post now |
| Content Calendar | `/dashboard/content/calendar` | Calendar month/week view | View schedule |
| Audience | `/dashboard/audience` | Profiles, Persona cards, Demographics | Generate personas |
| Analytics | `/dashboard/analytics` | KPI summary, Posts table, Revenue | Export report |
| Learning Engine | `/dashboard/learning` | Patterns, Recommendations với priority | Apply, Dismiss |
| AI Engine | `/dashboard/ai` | Provider status, Budget widget, Usage logs | Monitor |

### Settings (7 screens)

| Màn hình | Route | Thành phần | User Actions |
|---|---|---|---|
| Account | `/settings/account` | Email, display name, password | Update profile |
| Connected Accounts | `/settings/accounts` | TikTok account list, last sync | Connect, Disconnect |
| Workspace | `/settings/workspace` | Name, slug, niche, timezone | Update |
| AI Budget | `/settings/ai-budget` | Usage chart, budget limit, reset date | Set limit |
| Team | `/settings/team` | Member list, Invite button | Invite (Phase 2) |
| Billing | `/settings/billing` | Plan, invoices, payment method | Upgrade (UI only) |
| Notifications | `/settings/notifications` | Notification preferences | Toggle |

**Tổng: 23 screens** xác nhận trong codebase.

---

## 5. Feature Inventory

### Accounts

| Tính năng | Input | Output |
|---|---|---|
| Đăng ký workspace | email, password, display name | JWT tokens, workspace + user created |
| Đăng nhập / Đăng xuất | email, password / refresh token | JWT pair / token revoked |
| Refresh token | refresh token | JWT mới |
| Kết nối TikTok OAuth | OAuth code (PKCE) | social_account record, tokens encrypted |
| Ngắt kết nối TikTok | account ID | Account deactivated |
| Account Groups | group name, account IDs | Group với members |
| Auto token refresh | Cron mỗi 30 phút | Tokens refreshed trước khi hết hạn |

### Trend Intelligence

| Tính năng | Input | Output |
|---|---|---|
| Trend Detection | TikTok API scan, niche filter | trend_detections records |
| Trend Scoring | velocity (40%) + volume (25%) + engagement (20%) + recency (15%) | Score 0–100 |
| Lifecycle Tracking | Score over time | Status: rising → peaked → declining → expired |
| Watchlist | trend ID, notes | trend_watchlist entry |
| Competitor Monitoring | TikTok username | competitor_profiles record |
| Manual Scan | POST /trends/scan | Scan triggered |

### Audience Intelligence

| Tính năng | Input | Output |
|---|---|---|
| Audience Profile Sync | TikTok API (mỗi 6 giờ) | audience_profiles: age, gender, countries, interests, active_hours (JSONB) |
| AI Persona Generation | audience_profile data | audience_personas: name, pain_points, motivations, content_preferences |
| Niche Discovery | Audience data | Niche opportunities |
| Monetization Opportunities | Audience + niche | Opportunities list |

### Content Brain & Factory

| Tính năng | Input | Output |
|---|---|---|
| AI Idea Generation | trend, persona, niche | content_ideas (generated_by_ai=true) |
| AI Hook Generation | idea context | Hook text |
| AI Script Generation | topic, format, tone, audience, CTA | Script outline (Hook + sections + CTA) |
| Content Status Machine | Status transition | draft → approved → in_production → published / archived |
| AI Voiceover | Script text, voice, speed | Audio file → MinIO |
| Subtitle Generation | Video/audio file | Subtitle file → MinIO |
| Asset Management | Upload/delete | content_assets → MinIO |
| Content Pipelines | Pipeline steps config | Reusable pipeline template |
| Pipeline Runs | Pipeline ID, idea ID | content_pipeline_runs với status tracking |
| Content Calendar | Date range | Calendar view |

### Analytics

| Tính năng | Input | Output |
|---|---|---|
| Post Metrics Sync | TikTok API (mỗi 3 giờ) | post_metrics: views, likes, comments, shares, saves, watch_time, revenue_usd |
| Analytics Dashboard | Date range, account filter | KPI summary, Top posts |
| Revenue Tracking | Post metrics | revenue_usd aggregated |
| Custom Report | Date range, metrics | Report (async) |
| Benchmarking | Workspace metrics | Benchmark comparison |

### Learning Engine

| Tính năng | Input | Output |
|---|---|---|
| Pattern Detection | Post metrics history | content_patterns: winning/losing, confidence %, evidence_count |
| Recommendations | Detected patterns | improvement_recommendations với priority |
| Apply/Dismiss | Recommendation ID | Status → applied / dismissed |
| Manual Trigger | POST /learning/analyze | Analysis job |

### AI Engine

| Tính năng | Input | Output |
|---|---|---|
| Multi-Provider Routing | Request complexity | Micro→Gemini Flash / Standard→GPT-4o-mini / Premium→GPT-4o |
| Auto Fallback | Provider error | Route sang fallback provider |
| Cost Tracking | Mỗi AI call | ai_usage_logs: tokens, cost_usd, duration_ms, status |
| Budget Enforcement | AI request + budget check | AI_BUDGET_EXCEEDED nếu vượt hạn mức |
| Prompt Management | Create/update template | Versioned ai_prompts |

---

## 6. User Flow

### Flow 1 — Registration & First Login

```
/register → Submit form
  → POST /auth/register
  → Workspace + User created, JWT issued
  → /onboarding (4-step wizard, TikTok connect optional)
  → /dashboard
```

### Flow 2 — Tạo nội dung từ Trend

```
/dashboard/trends → Filter → Click card
  → /dashboard/trends/[id] → "Generate content idea"
  → /dashboard/content/generate → Fill brief → Generate
  → [POST /content/ideas/generate] → AI call → idea created
  → "Lưu & Bắt đầu" → /content/[id]/media

Step 2: Upload video + Generate voiceover → /content/[id]/caption
Step 3: Edit caption + hashtags + settings → /content/[id]/publish
Step 4: Select account + time → "Lên lịch" hoặc "Đăng ngay"
```

### Flow 3 — Token Auto-Refresh (transparent)

```
API trả 401 sau 15 phút
  → Axios interceptor detect 401
  → Auto POST /auth/refresh
  → Nếu OK: retry request gốc
  → Nếu fail: redirect /login
```

### Flow 4 — Analytics

```
/dashboard/analytics → [GET /analytics/overview]
  → Xem KPIs, Top Posts, Revenue
  → [Background] AnalyticsSyncJob mỗi 3 giờ cập nhật metrics

/dashboard/learning → Xem patterns + recommendations
  → Apply → [PATCH /learning/recommendations/{id}/status]
```

---

## 7. System Flow

### AI Content Generation

```
POST /api/v1/content/ideas/generate
  → JWT middleware → extract tenant_id, user_id
  → Carter Endpoint → MediatR Send(GenerateIdeaCommand)
  → GenerateIdeaHandler:
      1. Check AI budget (ai_usage_logs vs limit)
      2. Load prompt từ ai_prompts (slug: "content-idea-generator")
      3. AIProviderRouter → Standard tier → GPT-4o-mini
      4. Gọi OpenAI API
      5. Log → ai_usage_logs (tokens, cost, duration)
      6. Parse → ContentIdea domain entity
      7. ContentIdea.Create() với generated_by_ai=true
      8. Save → content_ideas (với tenant_id)
      9. Raise ContentIdeaCreatedEvent → outbox_messages
  → ApiResponse{data: ideaId}
```

### TikTok OAuth Connect

```
User click "Connect TikTok"
  → Redirect TikTok authorization URL (PKCE)
  → User approve → TikTok redirect /auth/tiktok/callback?code=...
  → ConnectTikTokHandler:
      1. Validate state (CSRF)
      2. Exchange code → tokens (TikTokOAuthService)
      3. Encrypt tokens (AES-256)
      4. Lưu → social_accounts
      5. Raise SocialAccountConnectedEvent
  → [Background] TikTokTokenRefreshJob monitor token expiry mỗi 30 phút
```

### Analytics Sync (Background)

```
[Hangfire] AnalyticsSyncJob mỗi 3 giờ
  → Lấy tất cả active social_accounts
  → Gọi TikTok API: post metrics per account
  → Update post_metrics
  → Invalidate Redis cache: analytics:overview:* + analytics:posts:*
```

### Domain Event Processing (Outbox Pattern)

```
Domain event raised (bất kỳ)
  → OutboxDomainEventDispatcher → serialize → outbox_messages
  → Trong cùng DB transaction với business data

[Hangfire] OutboxProcessor mỗi 10 giây
  → Query unprocessed outbox_messages
  → MediatR.Publish(event)
  → Update processed_at = now()
```

### Caching Strategy

```
Request đến
  → Check Redis key
  → HIT: return (TTL theo tier)
  → MISS: query PostgreSQL → set Redis → return

Cache TTLs:
  Trend feed:           60 giây   (Hot)
  Audience profile:     10 phút   (Warm)
  Analytics overview:   10 phút   (Warm)
  Prompt templates:     1 giờ     (Cold)
  AI Recommendations:   1 giờ     (Cold)
  Workspace info:       24 giờ    (Frozen)
```

---

## 8. Automation Flow

### Automation hiện có

| Automation | Trigger | Điều kiện | Kết quả |
|---|---|---|---|
| OAuth Token Refresh | Cron mỗi 30 phút | Token expires trong 2h | Token refreshed |
| Audience Data Sync | Cron mỗi 6 giờ | Account active & token valid | audience_profiles updated |
| Analytics Sync | Cron mỗi 3 giờ | Account active & token valid | post_metrics updated |
| Domain Event Processing | Cron mỗi 10 giây | Unprocessed outbox_messages | Events dispatched |
| AI Provider Fallback | Event-driven: provider error | Primary provider fails | Auto-route sang fallback |

### Không tìm thấy

- Auto-publish job (scheduled content → TikTok API)
- `TrendScanJob` tồn tại nhưng **chưa đăng ký trong Program.cs**
- Trigger-based content pipeline automation
- Email notification automation
- Learning analysis cron (manual trigger only)

---

## 9. Background Jobs

Hangfire với PostgreSQL backend, 5 worker threads, queues: `default` / `critical` / `low`.

| Job | Class | Schedule | Module | Mục đích |
|---|---|---|---|---|
| `outbox-processor` | `OutboxProcessor` | Mỗi 10 giây | Infrastructure | Publish domain events từ outbox |
| `tiktok-token-refresh` | `TikTokTokenRefreshJob` | Mỗi 30 phút | Accounts | Refresh TikTok OAuth tokens sắp hết |
| `audience-sync` | `AudienceSyncJob` | Mỗi 6 giờ | Audience | Sync demographics từ TikTok API |
| `analytics-sync` | `AnalyticsSyncJob` | Mỗi 3 giờ | Analytics | Pull post metrics từ TikTok API |
| `trend-scan` | `TrendScanJob` | **Chưa đăng ký** | Trends | Scan TikTok cho trending keywords |

> **Quan trọng:** `TrendScanJob` class tồn tại trong `Trendify.Modules.Trends` nhưng không được đăng ký làm recurring job trong `Program.cs`. Trend data chỉ có thể được trigger thủ công qua `POST /api/v1/trends/scan`.

---

## 10. Database Domain Overview

Tất cả entities kế thừa `TenantEntity`: `id UUID`, `tenant_id UUID NOT NULL`, `created_at`, `updated_at`, `deleted_at` (soft delete).

### Entities và quan hệ

| Entity | Table | Mô tả | Quan hệ chính |
|---|---|---|---|
| **Workspace** | `workspaces` | Tenant root. plan, slug unique | 1 → N Users, N SocialAccounts |
| **User** | `users` | Owner của workspace. password_hash, role='owner' | N → 1 Workspace |
| **SocialAccount** | `social_accounts` | TikTok account. Tokens AES-256 encrypted | N → 1 Workspace |
| **AccountGroup** | `account_groups` | Nhóm SocialAccounts | N:M ↔ SocialAccount |
| **TrendDetection** | `trend_detections` | Score 0–100. Status: rising/peaked/declining/expired | → N ContentIdeas |
| **TrendWatchlist** | `trend_watchlist` | User bookmark trend, có notes | N:M User ↔ TrendDetection |
| **CompetitorProfile** | `competitor_profiles` | TikTok account đối thủ. last_analyzed_at | → Workspace |
| **AudienceProfile** | `audience_profiles` | Demographics JSONB: age, gender, countries, interests, active_hours | N:1 → SocialAccount |
| **AudiencePersona** | `audience_personas` | AI persona. demographics/pain_points/motivations/preferences (JSONB) | → SocialAccount (optional) |
| **ContentIdea** | `content_ideas` | Title, hook, script, cta. Status machine. | → Trend, → Persona, → N Assets |
| **ContentAsset** | `content_assets` | Video/audio/subtitle/thumbnail. storage_key → MinIO | N:1 → ContentIdea |
| **ContentPipeline** | `content_pipelines` | Template quy trình. steps JSONB | → N Runs |
| **ContentPipelineRun** | `content_pipeline_runs` | Execution. status: pending/running/completed/failed | → Pipeline, → ContentIdea |
| **ContentPost** | `content_posts` | Bài đã đăng. platform_post_id, caption, posted_at | → SocialAccount, → ContentIdea |
| **PostMetrics** | `post_metrics` | Time-series: views, likes, comments, shares, saves, watch_time, revenue_usd | N:1 → ContentPost |
| **ContentPattern** | `content_patterns` | winning/losing. confidence %, evidence_count | → Workspace |
| **ImprovementRecommendation** | `improvement_recommendations` | priority: low/medium/high/critical. status: active/applied/dismissed | → Workspace, → SocialAccount |
| **AIPrompt** | `ai_prompts` | Versioned templates. tenant_id NULL = system-level | → Workspace (optional) |
| **AIUsageLog** | `ai_usage_logs` | Mọi AI call: provider, model, tokens, cost_usd, duration_ms | → Workspace, → User |
| **OutboxMessage** | `outbox_messages` | Durable event store. processed_at NULL = chưa xử lý | Infrastructure only |

### Relationship Map

```
Workspace (Tenant)
├── Users (N)
├── SocialAccounts (N TikTok accounts)
│   ├── AudienceProfiles (time-series demographics)
│   ├── AudiencePersonas (AI-generated)
│   └── ContentPosts → PostMetrics (time-series)
├── TrendDetections (N) → Watchlist entries
├── CompetitorProfiles (N)
├── ContentIdeas (N)
│   ├── → TrendDetection (optional)
│   ├── → AudiencePersona (optional)
│   ├── ContentAssets (video/audio/subtitle)
│   └── ContentPipelineRuns
├── ContentPipelines (reusable templates)
├── ContentPatterns (AI-detected)
├── ImprovementRecommendations
├── AIPrompts (tenant + system-level)
└── AIUsageLogs (per-request cost)
```

---

## 11. API Overview

Base URL: `/api/v1`. Response envelope: `{ data, meta, error }`. Framework: ASP.NET Core 9 + Carter.

| Group | Base path | Endpoints | Auth | Mục đích |
|---|---|---|---|---|
| Auth | `/auth/*` | 6 | Không | Register, Login, Refresh, Logout, Reset password |
| Accounts | `/accounts/*` | 14 | Có | Workspace, Users, Social accounts, Groups |
| Trends | `/trends/*` | 10 | Có | List, detail, watchlist, competitors, scan |
| Audience | `/audience/*` | 8 | Có | Profiles, personas, niches, monetization |
| Content | `/content/*` | ~15 | Có | Ideas CRUD, AI generation, strategy |
| Content Factory | `/factory/*` | ~12 | Có | Pipelines, runs, assets, voice, subtitle |
| Analytics | `/analytics/*` | 8 | Có | Overview, posts, revenue, reports, benchmark |
| Learning | `/learning/*` | 5 | Có | Patterns, recommendations, apply/dismiss |
| AI Engine | `/ai/*` | 5 | Có | Prompts, usage logs, budget |
| System | `/health`, `/version` | 3 | Không | Health check, readiness, version |

**Tổng: ~86 endpoints**

### AI Provider Routing

| Tier | Complexity | Primary | Fallback |
|---|---|---|---|
| Micro | < 200 tokens | gemini-flash-1.5 | claude-haiku-4-5 |
| Standard | 200–1000 tokens | gpt-4o-mini | claude-sonnet-4-6 |
| Premium | 1000+ tokens | gpt-4o | claude-opus-4-8 |

### Rate Limits

| Loại | Limit | Window |
|---|---|---|
| Default | 100 req | 1 phút |
| AI endpoints | 20 req | 1 phút |
| TikTok sync | 10 req | 1 phút |
| Reports | 5 req | 1 phút |

### Error Codes (nguồn: `ErrorCodes.cs`)

`UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `VALIDATION_ERROR` (422), `RATE_LIMITED` (429), `AI_BUDGET_EXCEEDED` (429), `INTERNAL_ERROR` (500), `UPSTREAM_ERROR` (502), `ACCOUNT_NOT_CONNECTED` (400), `PIPELINE_RUNNING` (409)

---

## 12. Event & Workflow Map

Từ `docs/decisions/2026-06-20-inter-module-communication.md`: Modules chỉ communicate qua domain events. Không có direct service imports giữa modules.

| Event | Raised by | Consumer | Kết quả |
|---|---|---|---|
| `AccountCreatedEvent` | RegisterWorkspaceHandler | Không tìm thấy handler | Workspace + User created |
| `SocialAccountConnectedEvent` | ConnectTikTokHandler | Không tìm thấy handler | Account connected |
| `TrendDetectedEvent` | TrendScanJob | Không tìm thấy handler | New trend_detection |
| `ContentIdeaCreatedEvent` | ContentIdea.Create() | Không tìm thấy handler | Idea in content list |
| `ContentIdeaApprovedEvent` | ContentIdea.Approve() | Không tìm thấy handler | Status → approved |
| `ContentIdeaPublishedEvent` | ContentIdea.MarkPublished() | Không tìm thấy handler | Status → published |
| `ImprovementRecommendationGeneratedEvent` | Learning module | Không tìm thấy handler | New recommendation |

> **Quan sát:** Domain events được định nghĩa và raised, nhưng **chưa có cross-module event handlers** trong Phase 1. Events được persisted vào outbox_messages nhưng không có module nào subscribe và xử lý chúng theo inter-module pattern. Phase 1 dùng in-process MediatR cho internal flows.

---

## 13. Current Product Capabilities

- `✓` = Frontend UI + Backend API đều tồn tại và xác nhận trong code
- `~` = UI tồn tại nhưng backend chưa xác nhận đầy đủ
- `✗` = Không có trong Phase 1

### Auth & Accounts

- `✓` Đăng ký workspace mới
- `✓` Đăng nhập / Đăng xuất
- `✓` JWT auto-refresh (Axios interceptor)
- `✓` Kết nối tài khoản TikTok (OAuth PKCE)
- `✓` Ngắt kết nối TikTok
- `✓` Quản lý nhiều tài khoản TikTok
- `✓` Account Groups
- `✗` Multi-user workspace / Team invite (UI có, backend Phase 2)
- `✗` Billing / Payment integration (UI có, không có Stripe)
- `✗` Email notifications (UI có, không có email service)

### Trends

- `✓` Xem danh sách xu hướng (filter niche, sort score/velocity)
- `✓` Xem chi tiết xu hướng (lifecycle, score history)
- `✓` Theo dõi xu hướng (Watchlist)
- `✓` Competitor profiles
- `~` Tự động phát hiện xu hướng (TrendScanJob class tồn tại nhưng chưa đăng ký cron)

### Audience

- `✓` Xem dữ liệu demographics (auto-sync mỗi 6 giờ)
- `✓` Tạo AI persona

### Content

- `✓` Tạo ý tưởng bằng AI
- `✓` Tạo Hook bằng AI
- `✓` Tạo Script bằng AI
- `✓` Content status machine (draft → approved → in_production → published)
- `✓` Upload video/audio assets → MinIO
- `✓` Tạo voiceover bằng AI
- `✓` Tạo subtitle tự động
- `✓` Quản lý caption và hashtags (UI đầy đủ)
- `✓` Content calendar view
- `✓` Content pipeline templates (backend có, frontend dùng riêng stepper)
- `~` Lên lịch đăng bài (UI đầy đủ, không tìm thấy scheduled publish job)
- `~` Đăng bài lên TikTok ("Đăng ngay" UI có, TikTok post API chưa xác nhận)

### Analytics & Learning

- `✓` Analytics dashboard (Views, Likes, Comments, Shares, Revenue)
- `✓` Post-level metrics (time-series, sync mỗi 3 giờ)
- `✓` Revenue tracking (revenue_usd)
- `✓` Tạo báo cáo (async)
- `✓` AI pattern detection (winning/losing patterns)
- `✓` AI recommendations (Apply/Dismiss)

### AI Engine

- `✓` Multi-provider routing (OpenAI + Anthropic + Gemini)
- `✓` Auto-fallback khi provider lỗi
- `✓` Cost tracking (mọi AI call)
- `✓` Budget enforcement (AI_BUDGET_EXCEEDED)
- `✓` Prompt template management (versioned)

### Không có trong codebase (gap với Affiliate Automation)

- `✗` Product catalog (không có entity Product)
- `✗` TikTok Shop integration
- `✗` Affiliate links
- `✗` Commission tracking
- `✗` Campaign management
- `✗` Conversion tracking theo product

---

## 14. End-to-End Workflow

### Toàn bộ vòng đời sử dụng

```
═══ BƯỚC 1: KHỞI TẠO ═══

/pricing → Chọn plan
  ↓
/register → email, password, display name → Submit
  → PostgreSQL: INSERT workspaces + users (role='owner')
  → JWT issued
  ↓
/onboarding (4 bước)
  → Bước 2: TikTok OAuth → social_accounts created
  → Bước 3: Chọn niche
  ↓
/dashboard (lần đầu tiên)


═══ BƯỚC 2: NGHIÊN CỨU ═══

/dashboard
  → Xem: AI Budget %, Trending Now feed, Quick stats
  ↓
/dashboard/trends
  → Filter niche → Sorted by score
  → GET /trends (cached Redis 60 giây)
  ↓
/dashboard/trends/[id]
  → Lifecycle, AI insights
  → "Add to watchlist" hoặc "Generate content idea"
  ↓
/dashboard/audience
  → Demographics + AI personas
  [Background] AudienceSyncJob mỗi 6 giờ


═══ BƯỚC 3: TẠO NỘI DUNG ═══

/dashboard/content/generate
  → Fill brief (topic, tone, format, audience)
  → POST /content/ideas/generate
  → AI: Standard tier → GPT-4o-mini
  → ai_usage_logs: tokens + cost recorded
  → content_ideas created (draft, generated_by_ai=true)
  → "Lưu & Bắt đầu" → /content/[id]/media

STEP 1 — /dashboard/content/[id]
  → ContentPipelineStepper (Step 1 active)
  → Review Hook, Script, Hashtags
  → Approve (status → 'approved')
  → "Tiếp theo: Media →"

STEP 2 — /dashboard/content/[id]/media
  → Upload video (drag-drop)
  → POST /factory/voice/generate → voiceover → MinIO
  → Chọn background music
  → "Tiếp theo: Caption →"

STEP 3 — /dashboard/content/[id]/caption
  → Edit caption (2200 chars max)
  → Hashtag manager (30 tags max)
  → Toggle: comments/duet/stitch/download
  → "Tiếp theo: Đăng bài →"

STEP 4 — /dashboard/content/[id]/publish
  → Chọn TikTok account
  → AI best-time suggestions (reach %)
  → HOẶC custom date/time
  → "LÊN LỊCH" → status → scheduled
  → "ĐĂNG NGAY" → status → in_production (→ published?)


═══ BƯỚC 4: THEO DÕI ═══

[Background] AnalyticsSyncJob mỗi 3 giờ
  → Pull post_metrics từ TikTok API
  → views, likes, comments, shares, saves, watch_time, revenue_usd

/dashboard/analytics
  → KPI dashboard, Top Posts, Revenue
  → Export report (async)


═══ BƯỚC 5: HỌC HỎI ═══

/dashboard/learning
  → POST /learning/analyze (manual trigger)
  → AI phân tích post_metrics history
  → content_patterns: winning/losing + confidence %
  → improvement_recommendations + priority
  → User: Apply (status='applied') / Dismiss (status='dismissed')


═══ VÒNG LẶP ═══

→ Quay lại /dashboard/trends
→ Lần này với dữ liệu thực + recommendations
→ Research → Create → Publish → Analyze → Learn → Research...
```

### Mức độ khớp với TikTok Affiliate Automation

Hệ thống hiện tại là **TikTok Content Creator OS**. Các thành phần cốt lõi của Affiliate Automation **chưa có**:

| Cần cho Affiliate | Trạng thái trong code |
|---|---|
| Product catalog | Không có entity Product |
| TikTok Shop API integration | Không tìm thấy |
| Affiliate link generation | Không có |
| Commission tracking | Không có |
| Campaign management | Không có Campaign entity |
| Conversion tracking per product | Không có (chỉ có revenue_usd tổng) |

**Foundation sẵn sàng để mở rộng:**

- Multi-tenant architecture (tenant_id trên mọi table)
- TikTok OAuth infrastructure (tokens + refresh)
- Analytics infrastructure (time-series PostMetrics)
- AI engine với cost tracking
- Background job infrastructure (Hangfire)
- Event-driven architecture (Outbox pattern)
- Modular monolith — có thể thêm module Affiliate mà không phá code hiện tại
