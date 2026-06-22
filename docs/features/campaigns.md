# Feature: Campaign Module

## Purpose

A Campaign is the central orchestration unit in Trendify.
It ties together a Product, a target Audience, generated Content, rendered Videos, and a Publishing schedule into a single trackable entity.

Nothing publishes to TikTok without a Campaign. Nothing generates content without a Campaign.

---

## Campaign Lifecycle

```
draft → active → paused → completed → archived
```

| Status | Meaning |
|---|---|
| `draft` | Being configured. No jobs are queued. |
| `active` | Content generation, video rendering, and publishing are running. |
| `paused` | All pending publish jobs are suspended. Resumable. |
| `completed` | Reached end date or video quota. No further publishing. Read-only. |
| `archived` | Soft-deleted. Hidden from default views. Analytics preserved. |

Allowed transitions:
- `draft` → `active` (on user Activate)
- `active` → `paused` (on user Pause or `ProductDelistedEvent`)
- `paused` → `active` (on user Resume)
- `active` → `completed` (when `videos_published >= videos_target` or `end_date` reached)
- Any non-archived status → `archived` (on user Archive)

---

## Entities

### Campaign

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | Workspace-scoped |
| name | VARCHAR(300) | User-defined, e.g. "Mini Vacuum — Q3" |
| product_id | UUID | FK → products. One product per campaign (Phase 1) |
| audience_persona_id | UUID | FK → audience_personas. Nullable — user can skip |
| status | VARCHAR(50) | See lifecycle above |
| content_style | VARCHAR(50) | 'educational', 'entertaining', 'review', 'ugc', 'comparison' |
| target_accounts | UUID[] | Array of social_account IDs to publish to |
| videos_target | INTEGER | Total videos to produce for this campaign |
| videos_per_day | SMALLINT | Max publish rate. See tier limits. |
| posting_times | JSONB | Array of HH:MM strings, e.g. ["08:00","18:00","22:00"] |
| start_date | DATE | Campaign begins publishing on this date |
| end_date | DATE | Nullable. Campaign auto-completes on this date |
| notes | TEXT | Internal notes. Not used in AI prompts. |
| videos_generated | INTEGER | Counter. Updated by Video Engine. |
| videos_published | INTEGER | Counter. Updated by Publish Engine. |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete (archived) |

### CampaignMetricsSummary

Aggregated performance snapshot per campaign. Rebuilt nightly from `post_metrics`.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| campaign_id | UUID | FK → campaigns |
| tenant_id | UUID | |
| total_views | BIGINT | Sum across all published videos |
| total_clicks | BIGINT | Affiliate link clicks |
| total_orders | INTEGER | Orders attributed |
| total_commission | DECIMAL(12,2) | Earned commission |
| avg_ctr | DECIMAL(5,4) | Avg CTR across videos |
| avg_cvr | DECIMAL(5,4) | Avg CVR across videos |
| best_video_id | UUID | FK → content_ideas or videos. Highest views |
| worst_video_id | UUID | Lowest views (published > 48h ago) |
| last_calculated_at | TIMESTAMPTZ | |

---

## Tier Limits

| Limit | Free | Pro | Agency |
|---|---|---|---|
| Active campaigns | 3 | 20 | Unlimited |
| `videos_per_day` max | 3 | 10 | 50 |
| `videos_target` max | 30 | 300 | Unlimited |
| Target accounts per campaign | 1 | 3 | 10 |

Enforcement: validated at campaign create/update. Rejected with `ErrorCodes.TierLimitExceeded`.

---

## Business Rules

1. A campaign must have exactly one product in Phase 1 (multi-product is Phase 3)
2. `target_accounts` must all belong to the same workspace (`tenant_id`)
3. `videos_per_day` must be ≥ 1 and ≤ tier limit
4. `posting_times` must contain exactly `videos_per_day` entries (no more, no fewer)
5. `start_date` must be today or a future date
6. `end_date`, if set, must be after `start_date`
7. A campaign with `status = draft` does not generate content, render videos, or schedule publish jobs
8. Activating a campaign triggers `CampaignActivatedEvent` — the Content Engine and Video Engine listen for this
9. A `ProductDelistedEvent` auto-pauses any campaign using that product
10. `videos_published` and `videos_generated` are incremented by downstream engines via domain events — never edited by users
11. Deleting (archiving) an active campaign first transitions it to `paused`, then `archived` — cancels all pending publish jobs
12. A campaign cannot be re-activated after `completed`

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `CampaignActivatedEvent` | Status changes to `active` | Content Engine (generate scripts), Video Engine (queue renders) |
| `CampaignPausedEvent` | Status changes to `paused` | Publish Engine (suspend pending jobs) |
| `CampaignResumedEvent` | Status changes back to `active` | Publish Engine (re-queue suspended jobs) |
| `CampaignCompletedEvent` | Quota reached or end date passed | Learning Engine (ingest campaign data for pattern analysis) |
| `CampaignArchivedEvent` | Status changes to `archived` | Publish Engine (cancel all pending jobs) |

---

## Domain Events Consumed

| Event | Source | Action |
|---|---|---|
| `ProductDelistedEvent` | Products | Pause all campaigns using the delisted product |
| `VideoRenderedEvent` | Video Engine | Increment `videos_generated` |
| `VideoPublishedEvent` | Publish Engine | Increment `videos_published`; check if quota reached → complete campaign |

---

## Background Jobs

### CampaignCompletionCheckJob
- Schedule: Every 30 minutes
- Process:
  1. Find all `active` campaigns where `end_date < today`
  2. Transition to `completed`, publish `CampaignCompletedEvent`

### CampaignMetricsRollupJob
- Schedule: Nightly at 02:00
- Process:
  1. For each campaign with status `active` or `completed`
  2. Aggregate `post_metrics` for all videos in the campaign
  3. Upsert `campaign_metrics_summary`

---

## API Endpoints

### Campaign CRUD

```
GET    /api/v1/campaigns
       ?status=draft|active|paused|completed
       ?page={n}&page_size={20}
       → PagedResult<CampaignSummaryDto>

POST   /api/v1/campaigns
       Body: CreateCampaignRequest
       → ApiResponse<CampaignDto>

GET    /api/v1/campaigns/{id}
       → ApiResponse<CampaignDetailDto>

PUT    /api/v1/campaigns/{id}
       Body: UpdateCampaignRequest (draft status only)
       → ApiResponse<CampaignDto>

DELETE /api/v1/campaigns/{id}
       → ApiResponse (archives campaign)
```

### Campaign Lifecycle Actions

```
POST /api/v1/campaigns/{id}/activate
     → ApiResponse<CampaignDto>

POST /api/v1/campaigns/{id}/pause
     → ApiResponse<CampaignDto>

POST /api/v1/campaigns/{id}/resume
     → ApiResponse<CampaignDto>
```

### Campaign Analytics

```
GET /api/v1/campaigns/{id}/metrics
    → ApiResponse<CampaignMetricsSummaryDto>

GET /api/v1/campaigns/{id}/videos
    ?status=generated|scheduled|published|failed
    ?page={n}&page_size={20}
    → PagedResult<VideoSummaryDto>
```

---

## DTOs

### CreateCampaignRequest
```json
{
  "name": "string",
  "product_id": "uuid",
  "audience_persona_id": "uuid | null",
  "content_style": "educational | entertaining | review | ugc | comparison",
  "target_accounts": ["uuid"],
  "videos_target": 20,
  "videos_per_day": 2,
  "posting_times": ["08:00", "18:00"],
  "start_date": "2026-07-01",
  "end_date": "2026-07-31 | null",
  "notes": "string | null"
}
```

### CampaignSummaryDto
```json
{
  "id", "name", "status", "content_style",
  "product": { "id", "name", "thumbnail_url", "commission_rate" },
  "videos_target", "videos_generated", "videos_published",
  "start_date", "end_date",
  "metrics": { "total_views", "total_commission", "avg_ctr" }
}
```

### CampaignDetailDto
```json
CampaignSummaryDto +
{
  "audience_persona": { "id", "name" } | null,
  "target_accounts": [{ "id", "platform", "username", "avatar_url" }],
  "posting_times",
  "notes",
  "created_at", "updated_at"
}
```

---

## Acceptance Criteria

### AC-1: Create Campaign
- [ ] User can create a campaign by selecting a product, content style, video target, and posting schedule
- [ ] System validates `videos_per_day` matches the number of `posting_times` entries
- [ ] System enforces tier limits — returns `TierLimitExceeded` error if exceeded
- [ ] Newly created campaign has status `draft` and no jobs are queued

### AC-2: Activate Campaign
- [ ] User can activate a draft campaign
- [ ] Activation triggers content generation (at least the first batch of scripts is generated within 2 minutes)
- [ ] Campaign cannot be activated if the linked product has status `out_of_stock` or `delisted`
- [ ] Campaign card shows real-time counters: videos generated / videos published / videos target

### AC-3: Pause & Resume
- [ ] User can pause an active campaign at any time
- [ ] Pausing suspends all scheduled publish jobs not yet sent
- [ ] User can resume a paused campaign — suspended publish jobs resume from where they stopped
- [ ] Paused state shows clearly in UI with a "Resume" CTA

### AC-4: Auto-pause on Delisted Product
- [ ] When a promoted product is delisted, all campaigns using it are auto-paused
- [ ] User sees a banner notification explaining why the campaign was paused
- [ ] Campaign remains paused until user either replaces the product or archives the campaign

### AC-5: Campaign Completion
- [ ] Campaign auto-completes when `videos_published >= videos_target`
- [ ] Campaign auto-completes when `end_date` is reached (checked every 30 minutes)
- [ ] Completed campaigns are read-only — no resume, no edits
- [ ] `CampaignCompletedEvent` is published so Learning Engine can analyze results

### AC-6: Campaign Analytics
- [ ] Campaign detail page shows total views, clicks, orders, commission earned
- [ ] Best-performing video is highlighted with a link to its detail
- [ ] Metrics are refreshed nightly — "last updated" timestamp is shown

---

## Implementation Notes

- `target_accounts` is stored as `UUID[]` in PostgreSQL — use array column, not a join table (Phase 1 simplicity; normalize in Phase 2 if needed)
- `posting_times` is stored as `JSONB` — array of `"HH:MM"` strings in 24-hour format, timezone is workspace timezone
- When activating, verify all `target_accounts` still belong to the tenant and are in `connected` status before proceeding
- `CampaignActivatedEvent` payload must include: `campaign_id`, `product_id`, `audience_persona_id`, `content_style`, `videos_target`, `tenant_id` — Content Engine and Video Engine need all of these to start work
- The `notes` field is for internal use only — it must never be injected into AI prompts to prevent prompt injection
