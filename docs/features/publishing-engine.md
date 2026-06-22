# Feature: Publishing Engine Module

## Purpose

Delivers rendered video files to TikTok accounts at the scheduled time.
The Publishing Engine has no knowledge of scripts, products, or campaigns beyond what it needs to post.
Its only contract is: receive a publish job → upload the video to TikTok at the right time → record the result.

---

## Publish Pipeline

```
PublishJob created (status: scheduled)
   ↓
Wait until scheduled_at
   ↓
1. Pre-flight check     — account connected? video file exists? within rate limit?
2. Download video       — fetch .mp4 from MinIO to worker temp storage
3. Initialize upload    — TikTok Content Posting API: POST /v2/post/publish/video/init/
4. Upload chunks        — stream file in chunks to TikTok upload URL
5. Publish post         — POST /v2/post/publish/video/publish/
6. Poll for result      — GET /v2/post/publish/status/fetch/ (up to 60s)
7. Store result         — save TikTok post ID, permalink, published_at
8. Emit VideoPublishedEvent
```

---

## Entities

### PublishJob

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | Workspace-scoped |
| campaign_id | UUID | FK → campaigns |
| render_job_id | UUID | FK → video_render_jobs |
| social_account_id | UUID | FK → social_accounts. Which TikTok account to post to |
| status | VARCHAR(50) | See job lifecycle below |
| scheduled_at | TIMESTAMPTZ | When to publish |
| caption | TEXT | Final caption including hashtags |
| hashtags | TEXT[] | Stored separately for analytics |
| tiktok_publish_id | VARCHAR(200) | TikTok's internal publish request ID (from init step) |
| tiktok_video_id | VARCHAR(200) | TikTok's video ID after successful publish |
| tiktok_share_url | TEXT | Public TikTok post URL |
| published_at | TIMESTAMPTZ | Actual publish timestamp from TikTok |
| error_code | VARCHAR(100) | TikTok error code or internal error code |
| error_message | TEXT | Human-readable failure reason |
| retry_count | SMALLINT | Max 3 retries |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### AccountDailyPublishCount

Rate limit tracking — prevents exceeding TikTok's per-account daily post limit.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| social_account_id | UUID | FK → social_accounts |
| date | DATE | Publish date |
| publish_count | SMALLINT | Posts published today |
| last_updated_at | TIMESTAMPTZ | |

Unique constraint: `(social_account_id, date)`

---

## Job Lifecycle

```
scheduled → publishing → published
                       ↘ failed
          ↘ cancelled
```

| Status | Meaning |
|---|---|
| `scheduled` | Waiting for `scheduled_at` to arrive |
| `publishing` | Worker is executing the upload pipeline |
| `published` | TikTok confirmed the post is live |
| `failed` | Upload or publish failed after max retries |
| `cancelled` | Campaign paused or archived before publish time |

---

## TikTok API Constraints

These are hard limits from the TikTok Content Posting API. Non-negotiable.

| Constraint | Limit | Notes |
|---|---|---|
| Max file size | 500 MB | Reject before upload if exceeded |
| Max duration | 60 seconds | Validated by Video Engine, enforced again here |
| Min duration | 10 seconds | Same |
| Allowed format | `.mp4` only | H.264 video + AAC audio |
| Max resolution | 4K (3840×2160) | 1080p is our standard — well within limit |
| Daily post limit per account | ~10–20 posts | TikTok does not publish an exact number; conservative limit = 10/day |
| API rate limit | 100 requests/minute | Applies to all API calls combined per app |
| Caption max length | 2200 characters | Truncate with `…` if exceeded |
| Hashtags | Included in caption | No separate hashtag field in the API |

---

## Business Rules

1. A publish job is created only when `VideoRenderedEvent` is received — never created manually
2. `scheduled_at` is derived from campaign `posting_times` for the next available slot that has no other job already scheduled for that account
3. If all posting slots for today are filled, the job is scheduled for the next available slot (next day)
4. A social account cannot exceed 10 publish jobs per calendar day (conservative TikTok rate limit)
5. Pre-flight check must pass before uploading: account token still valid, video file exists in MinIO, daily limit not exceeded
6. If account token is expired, the job is held in `scheduled` and a `AccountTokenExpiredEvent` is published — the job does NOT fail automatically
7. Caption is assembled as: `{caption_text}\n\n{hashtags joined by space}`. Max 2200 chars — truncate `caption_text` if needed, never truncate hashtags
8. Retry policy: max 3 retries with exponential backoff (1m, 5m, 15m)
9. After 3 failures, status → `failed` — the job is not retried again without user intervention
10. A `cancelled` job is never retried or rescheduled
11. Published jobs are immutable — `tiktok_video_id` and `published_at` cannot be changed after set

---

## TikTok API Error Handling

| TikTok Error Code | Action |
|---|---|
| `spam_risk_too_high` | Mark `failed`, do not retry. Notify user. |
| `video_quality_too_low` | Mark `failed`, do not retry. Surface to Video Engine for quality improvement. |
| `account_not_eligible` | Mark `failed`, do not retry. Account may need TikTok Creator account upgrade. |
| `duplicate_video` | Mark `failed`, do not retry. Log as warning. |
| `rate_limit_exceeded` | Reschedule +1 hour, retry (counts as a retry). |
| `server_error` (5xx) | Retry with backoff. |
| Token expired | Hold job, emit `AccountTokenExpiredEvent`. |

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `VideoPublishedEvent` | Status → `published` | Campaign (increment `videos_published`), Analytics (create initial metrics record) |
| `VideoPublishFailedEvent` | Status → `failed` | User notification |
| `AccountTokenExpiredEvent` | Token validation fails during pre-flight | Accounts module (prompt user to reconnect) |

### VideoPublishedEvent Payload

```json
{
  "publish_job_id": "uuid",
  "campaign_id": "uuid",
  "tenant_id": "uuid",
  "social_account_id": "uuid",
  "tiktok_video_id": "string",
  "tiktok_share_url": "string",
  "published_at": "ISO8601",
  "caption": "string",
  "hashtags": ["string"]
}
```

---

## Domain Events Consumed

| Event | Source | Action |
|---|---|---|
| `VideoRenderedEvent` | Video Engine | Create `PublishJob` with next available `scheduled_at` |
| `CampaignPausedEvent` | Campaign | Cancel all `scheduled` publish jobs for that campaign |
| `CampaignResumedEvent` | Campaign | Recreate publish jobs for rendered videos that were cancelled (reschedule from next available slot) |
| `CampaignArchivedEvent` | Campaign | Cancel all `scheduled` publish jobs permanently |

---

## Background Jobs

### PublishSchedulerJob
- Schedule: Every minute
- Process:
  1. Query `publish_jobs` WHERE `status = 'scheduled'` AND `scheduled_at <= NOW()`
  2. For each due job, enqueue `PublishWorker` task (Hangfire fire-and-forget)
  3. Transition job status to `publishing`

### PublishWorker
- Trigger: Enqueued by `PublishSchedulerJob` (not interval-based)
- Process: Execute the full publish pipeline (steps 1–8 above)
- Timeout: 10 minutes hard kill per job

### StalePublishJobCleanupJob
- Schedule: Every 30 minutes
- Process: Find jobs stuck in `publishing` for > 15 minutes (worker crash) → reset to `scheduled` for retry if `retry_count < 3`

---

## Scheduling Algorithm

When `VideoRenderedEvent` arrives with `target_accounts: [uuid_1, uuid_2]`:

For each account:
1. Load campaign `posting_times` (e.g. `["08:00", "18:00", "22:00"]`)
2. Load `account_daily_publish_count` for today and next 7 days
3. Find the **earliest** slot where:
   - Time is in the future (> 5 minutes from now to allow for queue pickup)
   - No other `PublishJob` already occupies that slot for that account
   - `daily_publish_count` for that day < 10
4. Create `PublishJob` with that `scheduled_at`
5. Increment the slot reservation (in-memory atomic check via Redis to prevent race condition)

---

## API Endpoints

```
GET  /api/v1/publishing/jobs
     ?campaign_id={uuid}
     ?status=scheduled|publishing|published|failed|cancelled
     ?page={n}&page_size={20}
     → PagedResult<PublishJobSummaryDto>

GET  /api/v1/publishing/jobs/{id}
     → ApiResponse<PublishJobDetailDto>

POST /api/v1/publishing/jobs/{id}/cancel
     (only for status = scheduled)
     → ApiResponse

POST /api/v1/publishing/jobs/{id}/retry
     (only for status = failed, resets retry_count to 0)
     → ApiResponse

GET  /api/v1/publishing/accounts/{account_id}/schedule
     ?from=YYYY-MM-DD&to=YYYY-MM-DD
     → ApiResponse<DailyScheduleDto[]>
```

---

## DTOs

### PublishJobSummaryDto
```json
{
  "id", "campaign_id", "status",
  "scheduled_at", "published_at",
  "social_account": { "id", "platform", "username", "avatar_url" },
  "tiktok_share_url",
  "retry_count", "error_message"
}
```

### DailyScheduleDto
```json
{
  "date": "YYYY-MM-DD",
  "slots": [
    {
      "time": "08:00",
      "publish_job_id": "uuid | null",
      "status": "scheduled | published | empty"
    }
  ],
  "publish_count": 2,
  "daily_limit": 10
}
```

---

## Acceptance Criteria

### AC-1: Job Creation on VideoRenderedEvent
- [ ] A `PublishJob` is created within 10 seconds of `VideoRenderedEvent` being received
- [ ] `scheduled_at` is the next available posting slot for the target account
- [ ] Job appears in the campaign's publishing schedule immediately

### AC-2: On-Time Publishing
- [ ] Job is picked up within 1 minute of `scheduled_at`
- [ ] TikTok post is live within 3 minutes of `scheduled_at`
- [ ] `published_at` reflects the actual TikTok publish timestamp (not the scheduled time)

### AC-3: Daily Rate Limit
- [ ] System never creates more than 10 publish jobs per account per day
- [ ] If all slots are full, job is pushed to the next day with the earliest available slot
- [ ] Account schedule page shows filled and empty slots visually

### AC-4: Retry on Failure
- [ ] Transient errors (5xx, rate limit) are retried automatically up to 3 times
- [ ] Non-retriable errors (spam risk, duplicate, account not eligible) fail immediately after 1 attempt
- [ ] After 3 failures, user sees a notification with the error reason
- [ ] User can manually trigger a retry on a failed job from the UI

### AC-5: Pause & Resume
- [ ] When campaign is paused, all `scheduled` jobs (not yet `publishing`) are cancelled immediately
- [ ] When campaign is resumed, new publish jobs are created for all rendered videos that had their jobs cancelled
- [ ] No duplicate posts — a video that was already `published` does not get re-queued on resume

### AC-6: Token Expiry Handling
- [ ] If a TikTok account token is expired during pre-flight, the job is held (not failed)
- [ ] User sees a banner: "Your TikTok account @{username} needs to be reconnected"
- [ ] After user reconnects the account, all held jobs for that account resume automatically

---

## Implementation Notes

- TikTok Content Posting API requires `Direct Post` mode (not `Inbox` draft mode) for automated publishing. The app must be approved for `video.publish` scope.
- Upload is chunked: use `chunk_size = 10 MB`, compute `total_chunk_count = ceil(file_size / chunk_size)`. TikTok requires the `chunk_index` to start at 0.
- After calling the publish endpoint, poll `/v2/post/publish/status/fetch/` with the `publish_id` every 5 seconds for up to 60 seconds. If still not confirmed after 60s, treat as success (TikTok processes asynchronously) and record the `publish_id` for later reconciliation.
- Redis key for slot reservation: `publish_slot:{account_id}:{date}:{time}` with a 24-hour TTL. Use `SETNX` (set if not exists) for atomic slot locking.
- Never log the full caption text in Serilog structured logs — it may contain user-entered content. Log `publish_job_id` and `character_count` only.
- The `AccountTokenExpiredEvent` must be published to the Outbox (not in-process) so the Accounts module receives it even if the Publishing Engine worker restarts mid-job.
