# API Map — Trendify

## Base URL

```
Development:  http://localhost:5000/api/v1
Production:   https://api.trendify.app/api/v1
```

---

## Standard Response Envelope

### Success
```json
{
  "data": { },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-20T10:00:00Z",
    "version": "1.0"
  },
  "error": null
}
```

### Error
```json
{
  "data": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-20T10:00:00Z",
    "version": "1.0"
  },
  "error": {
    "code": "TREND_NOT_FOUND",
    "message": "The requested trend was not found.",
    "details": []
  }
}
```

### Paginated List
```json
{
  "data": {
    "items": [],
    "cursor": "next_page_cursor_string",
    "hasMore": true,
    "total": 150
  },
  "meta": { },
  "error": null
}
```

---

## Authentication

All endpoints (except `/auth/*`) require:

```
Authorization: Bearer <jwt_access_token>
```

---

## Rate Limits

| Tier | Limit | Window |
|---|---|---|
| Default | 100 req | 1 minute |
| AI endpoints | 20 req | 1 minute |
| TikTok sync | 10 req | 1 minute |
| Reports | 5 req | 1 minute |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1750420800
```

---

## Module: Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new workspace + owner | No |
| POST | `/auth/login` | Login, returns JWT pair | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Revoke refresh token | Yes |
| POST | `/auth/forgot-password` | Request password reset email | No |
| POST | `/auth/reset-password` | Reset password with token | No |

---

## Module: Accounts

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/accounts/workspace` | Get current workspace info | Yes |
| PATCH | `/accounts/workspace` | Update workspace settings | Yes |
| GET | `/accounts/users` | List workspace members | Yes |
| POST | `/accounts/users/invite` | Invite team member (Phase 2) | Yes |
| GET | `/accounts/social` | List social accounts | Yes |
| POST | `/accounts/social` | Connect new social account | Yes |
| GET | `/accounts/social/{id}` | Get social account details | Yes |
| DELETE | `/accounts/social/{id}` | Disconnect social account | Yes |
| POST | `/accounts/social/{id}/sync` | Trigger manual sync | Yes |
| GET | `/accounts/groups` | List account groups | Yes |
| POST | `/accounts/groups` | Create account group | Yes |
| PATCH | `/accounts/groups/{id}` | Update group | Yes |
| DELETE | `/accounts/groups/{id}` | Delete group | Yes |
| POST | `/accounts/groups/{id}/members` | Add account to group | Yes |
| DELETE | `/accounts/groups/{id}/members/{accountId}` | Remove from group | Yes |

---

## Module: Trend Intelligence

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/trends` | List detected trends (paginated, filterable) | Yes |
| GET | `/trends/{id}` | Get trend details + lifecycle | Yes |
| GET | `/trends/feed` | Real-time trend feed (SSE or polling) | Yes |
| POST | `/trends/watchlist` | Add trend to watchlist | Yes |
| DELETE | `/trends/watchlist/{id}` | Remove from watchlist | Yes |
| GET | `/trends/watchlist` | Get watchlist | Yes |
| GET | `/trends/competitors` | List competitor profiles | Yes |
| POST | `/trends/competitors` | Add competitor to monitor | Yes |
| DELETE | `/trends/competitors/{id}` | Remove competitor | Yes |
| POST | `/trends/scan` | Trigger manual trend scan | Yes |

---

## Module: Audience Intelligence

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/audience/profiles` | List audience profiles per account | Yes |
| GET | `/audience/profiles/{socialAccountId}` | Get profile for specific account | Yes |
| POST | `/audience/profiles/{socialAccountId}/refresh` | Trigger re-analysis | Yes |
| GET | `/audience/personas` | List AI-generated personas | Yes |
| POST | `/audience/personas/generate` | Generate personas with AI | Yes |
| GET | `/audience/personas/{id}` | Get persona detail | Yes |
| DELETE | `/audience/personas/{id}` | Delete persona | Yes |
| GET | `/audience/niches` | List discovered niches | Yes |
| GET | `/audience/monetization` | Get monetization opportunities | Yes |

---

## Module: Content Brain

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/content/ideas` | List content ideas (paginated) | Yes |
| POST | `/content/ideas` | Create idea manually | Yes |
| GET | `/content/ideas/{id}` | Get idea detail | Yes |
| PATCH | `/content/ideas/{id}` | Update idea | Yes |
| DELETE | `/content/ideas/{id}` | Archive idea | Yes |
| POST | `/content/ideas/generate` | Generate ideas with AI | Yes |
| POST | `/content/ideas/{id}/generate-hook` | Generate hook for idea | Yes |
| POST | `/content/ideas/{id}/generate-script` | Generate full script | Yes |
| POST | `/content/ideas/{id}/generate-cta` | Generate CTA options | Yes |
| GET | `/content/strategy` | Get content strategy | Yes |
| POST | `/content/strategy/generate` | Generate strategy with AI | Yes |

---

## Module: Content Factory

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/factory/pipelines` | List production pipelines | Yes |
| POST | `/factory/pipelines` | Create pipeline | Yes |
| PATCH | `/factory/pipelines/{id}` | Update pipeline | Yes |
| DELETE | `/factory/pipelines/{id}` | Delete pipeline | Yes |
| POST | `/factory/pipelines/{id}/run` | Run pipeline for an idea | Yes |
| GET | `/factory/runs` | List pipeline runs | Yes |
| GET | `/factory/runs/{id}` | Get run status & output | Yes |
| GET | `/factory/assets` | List media assets | Yes |
| GET | `/factory/assets/{id}` | Get asset + download URL | Yes |
| DELETE | `/factory/assets/{id}` | Delete asset | Yes |
| POST | `/factory/voice/generate` | Generate voice audio | Yes |
| POST | `/factory/subtitles/generate` | Generate subtitles from audio | Yes |

---

## Module: Analytics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/analytics/overview` | Dashboard summary metrics | Yes |
| GET | `/analytics/posts` | List posts with metrics | Yes |
| GET | `/analytics/posts/{id}` | Get post performance detail | Yes |
| GET | `/analytics/accounts/{socialAccountId}` | Account-level analytics | Yes |
| GET | `/analytics/trends` | Analytics trend over time | Yes |
| GET | `/analytics/revenue` | Revenue summary | Yes |
| POST | `/analytics/reports` | Generate custom report | Yes |
| GET | `/analytics/reports/{id}` | Get report (async) | Yes |
| GET | `/analytics/benchmark` | Performance benchmarking | Yes |

---

## Module: Learning Engine

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/learning/patterns` | List detected patterns | Yes |
| GET | `/learning/patterns/{id}` | Get pattern detail + evidence | Yes |
| GET | `/learning/recommendations` | List improvement recommendations | Yes |
| GET | `/learning/recommendations/{id}` | Get recommendation detail | Yes |
| PATCH | `/learning/recommendations/{id}/status` | Apply or dismiss recommendation | Yes |
| POST | `/learning/analyze` | Trigger learning analysis manually | Yes |

---

## Module: AI Engine (Internal/Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/ai/prompts` | List prompts | Yes |
| POST | `/ai/prompts` | Create prompt | Yes |
| GET | `/ai/prompts/{id}` | Get prompt | Yes |
| PATCH | `/ai/prompts/{id}` | Update prompt (creates new version) | Yes |
| GET | `/ai/usage` | AI usage summary | Yes |
| GET | `/ai/usage/logs` | Detailed usage logs | Yes |
| GET | `/ai/budget` | Current token budget status | Yes |

---

## System Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/health` | Basic health check | No |
| GET | `/health/ready` | Readiness check (db, cache, storage) | No |
| GET | `/version` | App version info | No |

---

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 422 | Request payload failed validation |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `AI_BUDGET_EXCEEDED` | 429 | AI token budget for this tenant exhausted |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `UPSTREAM_ERROR` | 502 | External API (TikTok, AI provider) failure |
| `ACCOUNT_NOT_CONNECTED` | 400 | TikTok account not connected or expired |
| `TREND_NOT_FOUND` | 404 | Trend does not exist |
| `IDEA_NOT_FOUND` | 404 | Content idea does not exist |
| `PIPELINE_RUNNING` | 409 | Pipeline is already running |
