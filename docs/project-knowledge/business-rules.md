# Business Rules — Trendify

## Global Rules (áp dụng mọi nơi)

### Multi-Tenancy
- `tenant_id` LUÔN được lấy từ JWT claims — không bao giờ từ request body
- Mọi query tự động filter `WHERE tenant_id = current_user.tenant_id`
- Không có dữ liệu nào được chia sẻ giữa các tenants (Phase 1-3)
- Bypass tenant filter cần explicit `[BypassTenantFilter]` attribute + code review

### Authentication & Authorization
- JWT access token: 15 phút TTL
- JWT refresh token: 7 ngày TTL
- Phase 1: chỉ có role `Owner`
- Phase 2+: `Owner > Admin > Editor > Viewer`
- Password hash: bcrypt

### External API Calls
- Tất cả TikTok API calls và AI provider calls được wrap trong retry + circuit breaker
- Không silent failure — luôn throw hoặc log nếu external call thất bại
- Respect rate limit headers từ external APIs (`X-RateLimit-*`)

### Data Handling
- Soft delete cho mọi user-facing entities (`deleted_at TIMESTAMPTZ NULL`)
- Không xóa historical data khi user disconnect tài khoản
- Content assets (video, audio) chỉ lưu trong MinIO — không bao giờ trong PostgreSQL

---

## Accounts Module Rules

1. Một workspace phải có **đúng một owner**
2. Một social account thuộc **đúng một workspace**
3. Một social account có thể thuộc **nhiều groups** (many-to-many)
4. Disconnect TikTok account → `is_active = false`, KHÔNG xóa dữ liệu lịch sử
5. Token refresh là tự động trước mỗi API call
6. Nếu refresh fail 3 lần → `status = token_expired` → cần user reconnect
7. Account sync (follower count, profile) chạy mỗi 6 giờ

---

## Trend Intelligence Rules

1. `TrendScanJob` chạy mỗi 15 phút
2. Trend được xem là "mới" nếu không có record cho keyword đó trong 24 giờ qua
3. Trend status transitions: `rising → peaking → declining → dead` (một chiều, không quay lại)
4. Trend score formula:
   ```
   score = velocity×0.40 + volume×0.25 + engagement×0.20 + recency×0.15
   ```
5. Chỉ publish `TrendDetectedEvent` khi `score > 70` (high-signal trend)
6. Trends > 90 ngày với status `dead` → archive to cold storage
7. Watchlist là per-tenant, không shared
8. Competitor profiles monitored for patterns, NOT cloned content

---

## Audience Intelligence Rules

1. `AudienceRefreshJob` chạy daily lúc 2 AM
2. Manual refresh rate-limited: **1 lần/giờ/account**
3. Tối đa **5 personas** per social account (Phase 1)
4. Persona generation requires AI token budget check trước
5. Personas có thể edit thủ công sau khi AI generate
6. Niche discovery = audience interests cross-reference với trend data

---

## Content Brain Rules

1. Idea generation check AI budget trước khi gọi AI
2. AI tiers:
   - `Micro` (rẻ nhất): Hook và CTA generation
   - `Standard`: Idea generation, short scripts
   - `Premium` (đắt nhất): Full script, strategy generation
3. Trend id trên idea = idea được inspire bởi detected trend
4. Ideas ở status `published` là immutable — linked tới Analytics post record
5. **Batch idea generation: tối đa 10 ideas/call**
6. Learning Engine top 3 winning patterns được inject vào AI context khi generate ideas

---

## Content Factory Rules

1. **Chỉ một pipeline run active per idea** — request thứ 2 trả về `409 PIPELINE_RUNNING`
2. Content assets lưu trong MinIO, không phải PostgreSQL
3. Assets KHÔNG auto-delete khi idea bị archive — phải xóa thủ công
4. Voice generation: ElevenLabs (configurable per workspace)
5. Subtitle generation: OpenAI Whisper
6. Pipeline steps chạy **tuần tự** trong Hangfire background job
7. **Không auto-retry** khi step fail — notify user và dừng lại
8. MinIO pre-signed download URLs expire sau 1 giờ — không expose permanent URLs

---

## Analytics Rules

1. `AnalyticsAggregationJob` fetch metrics mỗi giờ cho posts < 30 ngày
2. Posts 30–90 ngày: refresh mỗi ngày
3. Posts > 90 ngày: refresh mỗi tuần
4. **`post_metrics` là append-only** — không bao giờ UPDATE rows
5. Dashboard hiển thị snapshot mới nhất: `MAX(recorded_at)` per post
6. Engagement rate = `(likes + comments + shares + saves) / views`
7. Revenue lưu bằng USD — convert ngay tại ingest
8. Post return 404 từ TikTok → mark `content_posts.status = deleted`

---

## Learning Engine Rules

1. `LearningAnalysisJob` chạy daily lúc 3 AM
2. **Cần tối thiểu 10 posts** với metrics để chạy có ý nghĩa — dưới đó skip
3. Patterns cần `evidence_count ≥ 5` để hiển thị cho user
4. Patterns `confidence < 50%` lưu internally nhưng không show trong UI
5. Recommendation chỉ đổi status sang `applied` khi user tự mark — hệ thống không auto-apply
6. Dismissed recommendations ẩn 30 ngày, sau đó resurface nếu còn valid
7. **Pattern detection là statistical/deterministic** — AI chỉ dùng để viết mô tả dạng text
8. Patterns là per-tenant — không cross-tenant learning (Phase 4 mới có)
9. Top 3 winning patterns được inject vào Content Brain context khi generate ideas

---

## AI Engine Rules

1. **Mọi AI call bắt buộc phải cung cấp:** `feature_context`, `tenant_id`, `user_id`, `correlation_id`
2. **Budget check TRƯỚC provider call** — không bao giờ sau
3. **Failed calls không tính vào budget** — log với `status = failed`
4. **Prompt slugs là contract** — đổi slug = breaking change
5. Inactive prompts (`is_active = false`) không thể dùng — throw tại load time
6. Prompt update KHÔNG overwrite — tạo version mới + deactivate version cũ
7. Token costs estimated tại call time (published pricing) — verify actual cost hàng tháng
8. **Fallback chain:** Primary provider → Secondary → throw `AIProviderUnavailableException`
9. **Tier routing:**
   - `Micro`: gemini-flash-1.5 → claude-haiku-4-5
   - `Standard`: gpt-4o-mini → claude-sonnet-4-6
   - `Premium`: gpt-4o → claude-opus-4-8

---

## Caching Rules

1. Cache key format: `{module}:{entity}:{id}:{variant}`
2. Invalidation: explicit delete on write — không dùng "invalidate all"
3. Tất cả cache key templates centralized trong `CacheKeys.cs`
4. TTL tiers:
   - Hot (60s): real-time metrics, live trend scores
   - Warm (10m): audience profiles, account summaries
   - Cold (1h): AI recommendations, analytics aggregates
   - Frozen (24h): reference data, platform config

---

## Code/Architecture Rules (không thay đổi)

1. Không module nào import types của module khác trực tiếp
2. Cross-module communication ONLY qua `IDomainEvent`
3. Không có God Classes hoặc massive controllers
4. Mọi API endpoint trả về `ApiResponse<T>` envelope
5. Input validation tại API boundary — không trong services
6. Prompt injection prevention trên mọi AI endpoint nhận user content
7. Không có unbounded AI loops — mọi loop có hard iteration cap
8. Secrets chỉ trong environment variables — không bao giờ trong code
