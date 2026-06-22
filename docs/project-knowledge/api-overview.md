# API Overview — Trendify

## Base URL

```
Development:  http://localhost:5000/api/v1
Production:   https://api.trendify.app/api/v1
```

---

## Standard Response Envelope (mọi endpoint)

```json
// Success
{
  "data": { ... },
  "meta": { "requestId": "uuid", "timestamp": "ISO8601", "version": "1.0" },
  "error": null
}

// Error
{
  "data": null,
  "meta": { "requestId": "uuid", "timestamp": "ISO8601", "version": "1.0" },
  "error": { "code": "TREND_NOT_FOUND", "message": "...", "details": [] }
}

// Paginated List
{
  "data": { "items": [], "cursor": "next_cursor", "hasMore": true, "total": 150 },
  "meta": { ... },
  "error": null
}
```

**Không bao giờ** trả về raw object ngoài envelope.

---

## Authentication

```
Authorization: Bearer <jwt_access_token>
```

Tất cả endpoints yêu cầu JWT ngoại trừ `/auth/*` và system endpoints.

---

## Rate Limits

| Nhóm | Limit | Window |
|---|---|---|
| Default | 100 req | 1 phút |
| AI endpoints | 20 req | 1 phút |
| TikTok sync | 10 req | 1 phút |
| Reports | 5 req | 1 phút |

Headers trả về: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Auth Endpoints

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/auth/register` | No |
| POST | `/auth/login` | No |
| POST | `/auth/refresh` | No |
| POST | `/auth/logout` | Yes |
| POST | `/auth/forgot-password` | No |
| POST | `/auth/reset-password` | No |

---

## Accounts Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/accounts/workspace` | Thông tin workspace hiện tại |
| PATCH | `/accounts/workspace` | Cập nhật workspace |
| GET | `/accounts/social` | Danh sách TikTok accounts |
| POST | `/accounts/social` | Kết nối TikTok mới (OAuth) |
| GET | `/accounts/social/{id}` | Chi tiết account |
| DELETE | `/accounts/social/{id}` | Ngắt kết nối |
| POST | `/accounts/social/{id}/sync` | Sync thủ công |
| GET/POST | `/accounts/groups` | Danh sách / tạo group |
| PATCH/DELETE | `/accounts/groups/{id}` | Cập nhật / xóa group |
| POST/DELETE | `/accounts/groups/{id}/members` | Thêm/xóa account khỏi group |

---

## Trend Intelligence Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/trends` | Danh sách trends (paginated, filterable) |
| GET | `/trends/{id}` | Chi tiết trend + lifecycle |
| GET | `/trends/feed` | Real-time trend feed (SSE hoặc polling) |
| POST/DELETE | `/trends/watchlist` | Thêm/xóa khỏi watchlist |
| GET | `/trends/watchlist` | Danh sách watchlist |
| GET | `/trends/competitors` | Danh sách competitor profiles |
| POST/DELETE | `/trends/competitors/{id}` | Thêm/xóa competitor |
| POST | `/trends/scan` | Trigger scan thủ công |

---

## Audience Intelligence Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/audience/profiles` | Danh sách audience profiles |
| GET | `/audience/profiles/{socialAccountId}` | Profile của account cụ thể |
| POST | `/audience/profiles/{socialAccountId}/refresh` | Trigger re-analysis |
| GET/POST | `/audience/personas` | Danh sách / generate personas |
| GET/DELETE | `/audience/personas/{id}` | Chi tiết / xóa persona |
| GET | `/audience/niches` | Niches đã discover |
| GET | `/audience/monetization` | Monetization opportunities |

---

## Content Brain Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST | `/content/ideas` | Danh sách / tạo idea thủ công |
| GET/PATCH/DELETE | `/content/ideas/{id}` | Chi tiết / cập nhật / archive |
| POST | `/content/ideas/generate` | Generate ideas bằng AI (max 10) |
| POST | `/content/ideas/{id}/generate-hook` | Generate hook variants |
| POST | `/content/ideas/{id}/generate-script` | Generate full script |
| POST | `/content/ideas/{id}/generate-cta` | Generate CTA options |
| GET | `/content/strategy` | Xem content strategy |
| POST | `/content/strategy/generate` | Generate strategy bằng AI |

---

## Content Factory Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST | `/factory/pipelines` | Danh sách / tạo pipeline |
| PATCH/DELETE | `/factory/pipelines/{id}` | Cập nhật / xóa pipeline |
| POST | `/factory/pipelines/{id}/run` | Chạy pipeline cho một idea |
| GET | `/factory/runs` | Danh sách pipeline runs |
| GET | `/factory/runs/{id}` | Trạng thái run + output |
| GET | `/factory/assets` | Danh sách media assets |
| GET/DELETE | `/factory/assets/{id}` | Lấy download URL / xóa asset |
| POST | `/factory/voice/generate` | Generate voice audio |
| POST | `/factory/subtitles/generate` | Generate subtitles |

---

## Analytics Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/analytics/overview` | Dashboard summary (30 ngày) |
| GET | `/analytics/posts` | Danh sách posts với metrics |
| GET | `/analytics/posts/{id}` | Chi tiết post performance |
| GET | `/analytics/accounts/{socialAccountId}` | Analytics của account cụ thể |
| GET | `/analytics/trends` | Analytics trend theo thời gian |
| GET | `/analytics/revenue` | Revenue summary |
| POST | `/analytics/reports` | Tạo custom report (async) |
| GET | `/analytics/reports/{id}` | Lấy report kết quả |
| GET | `/analytics/benchmark` | So sánh với niche average |

---

## Learning Engine Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/learning/patterns` | Danh sách patterns đã detect |
| GET | `/learning/patterns/{id}` | Chi tiết pattern + evidence |
| GET | `/learning/recommendations` | Danh sách recommendations |
| GET | `/learning/recommendations/{id}` | Chi tiết recommendation |
| PATCH | `/learning/recommendations/{id}/status` | Apply hoặc Dismiss |
| POST | `/learning/analyze` | Trigger phân tích thủ công |

---

## AI Engine Endpoints (Admin/Internal)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST | `/ai/prompts` | Danh sách / tạo prompt |
| GET/PATCH | `/ai/prompts/{id}` | Xem / cập nhật prompt (tạo version mới) |
| GET | `/ai/usage` | Usage summary |
| GET | `/ai/usage/logs` | Detailed per-call logs |
| GET | `/ai/budget` | Budget status tháng hiện tại |

---

## System Endpoints (No auth)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/health` | Basic health check |
| GET | `/health/ready` | Readiness (db, cache, storage) |
| GET | `/version` | App version |

---

## Error Codes

| Code | HTTP | Khi nào |
|---|---|---|
| `UNAUTHORIZED` | 401 | JWT missing/invalid |
| `FORBIDDEN` | 403 | Không đủ permission |
| `NOT_FOUND` | 404 | Resource không tồn tại |
| `VALIDATION_ERROR` | 422 | Request payload sai |
| `RATE_LIMITED` | 429 | Vượt rate limit |
| `AI_BUDGET_EXCEEDED` | 429 | AI token budget của tenant đã hết |
| `INTERNAL_ERROR` | 500 | Server error không mong muốn |
| `UPSTREAM_ERROR` | 502 | TikTok API hoặc AI provider thất bại |
| `ACCOUNT_NOT_CONNECTED` | 400 | TikTok account chưa kết nối hoặc hết hạn |
| `TREND_NOT_FOUND` | 404 | Trend không tồn tại |
| `IDEA_NOT_FOUND` | 404 | Content idea không tồn tại |
| `PIPELINE_RUNNING` | 409 | Pipeline đang chạy cho idea này rồi |

---

## API Versioning

- URL path versioning: `/api/v1/`, `/api/v2/`
- Breaking changes → version mới
- Version cũ giữ 1 release cycle
- Deprecation thông báo qua header: `Deprecation: date`
