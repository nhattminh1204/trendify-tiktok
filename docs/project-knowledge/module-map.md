# Module Map — Trendify

## Tổng quan 8 Modules

```
┌─────────────────────────────────────────────────────────────┐
│                     Trendify Platform                        │
├──────────────┬──────────────────┬───────────────────────────┤
│   Accounts   │ Trend Intelligence│   Audience Intelligence  │
├──────────────┼──────────────────┼───────────────────────────┤
│ Content Brain│ Content Factory  │       Analytics           │
├──────────────┴──────────────────┴───────────────────────────┤
│                    Learning Engine                           │
├─────────────────────────────────────────────────────────────┤
│                      AI Engine                              │
├─────────────────────────────────────────────────────────────┤
│         Shared Infrastructure (Auth, Cache, Events)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Chi tiết

### 1. Accounts
**Trách nhiệm:** Identity, workspace, social account management  
**Directory:** `src/modules/accounts`  
**Spec:** `docs/features/accounts.md`

Quản lý:
- Workspace (= Tenant): container cấp cao nhất cho mọi dữ liệu
- User: người dùng trong workspace (Phase 1: chỉ Owner)
- SocialAccount: tài khoản TikTok được kết nối
- AccountGroup: nhóm tài khoản (ví dụ: "English Accounts", "Fitness Niche")

**Đây là module nền tảng** — mọi module khác phụ thuộc vào dữ liệu của Accounts.

---

### 2. Trend Intelligence
**Trách nhiệm:** Phát hiện, đánh giá và theo dõi trends TikTok  
**Directory:** `src/modules/trends`  
**Spec:** `docs/features/trends.md`

Quản lý:
- TrendDetection: trend signal từ TikTok API, có score 0–100
- TrendWatchlist: danh sách trends người dùng theo dõi
- CompetitorProfile: tài khoản cạnh tranh cần monitor

**Job:** `TrendScanJob` chạy mỗi 15 phút.

**Score algorithm:**
```
score = velocity_score×0.40 + volume_score×0.25 + engagement_score×0.20 + recency_score×0.15
```

---

### 3. Audience Intelligence
**Trách nhiệm:** Phân tích audience demographics, sinh personas, tìm niches  
**Directory:** `src/modules/audience`  
**Spec:** `docs/features/audience.md`

Quản lý:
- AudienceProfile: snapshot demographics của từng tài khoản (age, gender, country, interests, active hours)
- AudiencePersona: AI-generated representation của typical viewer

**Job:** `AudienceRefreshJob` chạy hàng ngày lúc 2 AM.

---

### 4. Content Brain
**Trách nhiệm:** AI-powered idea generation, hook/script/CTA writing  
**Directory:** `src/modules/content` (sub-module của Content)  
**Spec:** `docs/features/content.md`

Quản lý:
- ContentIdea: ý tưởng content với title, description, hook, script, CTA
- Idea lifecycle: `draft → approved → in_production → published → archived`

Inputs cho AI generation:
- Trend context (từ Trend Intelligence)
- Audience persona (từ Audience Intelligence)
- Winning patterns (từ Learning Engine)

---

### 5. Content Factory
**Trách nhiệm:** Production pipeline — biến ideas thành media assets  
**Directory:** `src/modules/content` (sub-module của Content)  
**Spec:** `docs/features/content.md`

Quản lý:
- ContentPipeline: workflow definition (voice generation → subtitles → notify)
- ContentPipelineRun: một lần chạy pipeline cho một idea
- ContentAsset: file được tạo ra (audio, subtitle, thumbnail) — lưu trong MinIO

---

### 6. Analytics
**Trách nhiệm:** Thu thập và hiển thị performance metrics của posts  
**Directory:** `src/modules/analytics`  
**Spec:** `docs/features/analytics.md`

Quản lý:
- ContentPost: bản ghi về một TikTok post được publish
- PostMetrics: snapshot metrics (views, likes, shares, revenue) — append-only

**Job:** `AnalyticsAggregationJob` chạy mỗi giờ.

---

### 7. Learning Engine
**Trách nhiệm:** Phân tích lịch sử để phát hiện patterns, sinh recommendations  
**Directory:** `src/modules/learning`  
**Spec:** `docs/features/learning.md`

Quản lý:
- ContentPattern: winning/losing patterns với confidence score
- ImprovementRecommendation: đề xuất cải thiện từ patterns

**Job:** `LearningAnalysisJob` chạy hàng ngày lúc 3 AM.  
**Cần tối thiểu 10 posts** trước khi có ý nghĩa.

---

### 8. AI Engine
**Trách nhiệm:** Central orchestration cho mọi AI calls — routing, cost tracking, budget  
**Directory:** `src/modules/ai-engine`  
**Spec:** `docs/features/ai-engine.md`

Quản lý:
- AIPrompt: versioned prompt templates (slug là contract)
- AIUsageLog: immutable record mọi AI call

**Quan trọng:** Không module nào gọi AI provider trực tiếp — tất cả đi qua AI Engine.

---

## Cấu trúc Internal Mỗi Module

```
src/modules/{module}/
  Domain/         — Aggregate roots, entities, error codes
  Application/
    Commands/     — CQRS write operations
    Queries/      — CQRS read operations
    Events/       — Domain event definitions + handlers
  Infrastructure/ — Repository, EF Core config
  API/            — Endpoints, request/response DTOs
```

---

## Shared Infrastructure

### src/shared/ — Contracts (interfaces only, no implementation)
- `ICurrentUser` — user/tenant identity
- `IDomainEvent` — base type cho inter-module events
- `ApiResponse<T>` — standard response envelope
- `ICacheService`, `IStorageService`, `IJobScheduler`, `IAIProvider`

### src/infrastructure/ — Implementations
- `AppDbContext` — EF Core (tất cả modules dùng chung)
- `RedisCacheService` — cache implementation
- `MediatREventDispatcher` — in-process event bus
- `MinIOStorageService` — file storage
- `AIProviderRouter` — cost-aware routing với fallback

---

## Background Jobs Tổng hợp

| Job | Module | Schedule |
|---|---|---|
| `TrendScanJob` | Trend Intelligence | Mỗi 15 phút |
| `CompetitorScanJob` | Trend Intelligence | Mỗi 6 giờ |
| `AudienceRefreshJob` | Audience Intelligence | 2 AM hàng ngày |
| `AnalyticsAggregationJob` | Analytics | Mỗi giờ |
| `AnalyticsArchiveJob` | Analytics | 4 AM hàng ngày |
| `LearningAnalysisJob` | Learning Engine | 3 AM hàng ngày |
| `ContentPublishJob` | Content Factory | On demand |
| `AIUsageSummaryJob` | AI Engine | Midnight hàng ngày |
| `AccountSyncJob` | Accounts | Mỗi 6 giờ |
