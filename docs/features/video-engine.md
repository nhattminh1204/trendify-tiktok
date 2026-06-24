# Feature: Video Engine Module

## Purpose

Renders `.mp4` video files from raw ingredients: a script, product assets, a voice style, and a visual template.
The Video Engine has no knowledge of TikTok, campaigns, or publishing. Its only contract is: receive a render job → produce a video file in MinIO → emit `VideoRenderedEvent`.

---

## Render Pipeline

```
VideoRenderJob created
   ↓
1. Fetch assets        — product images/video from MinIO
2. Generate voice      — TTS API (ElevenLabs / OpenAI TTS)
3. Generate subtitle   — align script text to audio timestamps
4. Build scene plan    — split script into visual segments
5. FFmpeg render       — composite scenes → .mp4
6. Quality check       — duration, resolution, file size
7. Upload to MinIO     — store final file
8. Emit VideoRenderedEvent
```

---

## Entities

### VideoRenderJob

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | Workspace-scoped |
| campaign_id | UUID | FK → campaigns |
| content_idea_id | UUID | FK → content_ideas. Source script |
| status | VARCHAR(50) | See job lifecycle below |
| template_id | VARCHAR(100) | Visual template key. e.g. 'product-review-v1' |
| voice_id | VARCHAR(100) | TTS voice identifier |
| voice_speed | DECIMAL(3,2) | 0.75–1.50. Default 1.00 |
| script_text | TEXT | Snapshot of script at render time |
| caption_text | TEXT | Caption for TikTok post (from Content Brain) |
| hashtags | TEXT[] | Array of hashtag strings |
| output_url | TEXT | MinIO URL of rendered .mp4. Null until complete |
| thumbnail_url | TEXT | MinIO URL of auto-generated thumbnail |
| duration_seconds | SMALLINT | Actual rendered duration |
| file_size_bytes | BIGINT | Final file size |
| error_message | TEXT | Null unless status is 'failed' |
| retry_count | SMALLINT | Max 3 retries |
| queued_at | TIMESTAMPTZ | |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### VideoAsset

Assets collected for a render job.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| render_job_id | UUID | FK → video_render_jobs |
| tenant_id | UUID | |
| asset_type | VARCHAR(50) | 'product_image', 'product_video', 'stock', 'bgm' |
| source_url | TEXT | Original source URL |
| minio_url | TEXT | Cached copy in MinIO |
| sort_order | SMALLINT | Scene sequence position |

### VideoTemplate

Available visual templates (system-managed, not per-tenant).

| Field | Type | Notes |
|---|---|---|
| id | VARCHAR(100) | e.g. 'product-review-v1' |
| name | VARCHAR(200) | Display name |
| description | TEXT | |
| aspect_ratio | VARCHAR(20) | '9:16' (TikTok default) |
| max_duration_seconds | SMALLINT | e.g. 60 |
| min_duration_seconds | SMALLINT | e.g. 15 |
| content_styles | TEXT[] | Compatible content styles from Campaign |
| preview_url | TEXT | Template preview video in MinIO |
| is_active | BOOLEAN | |

---

## Job Lifecycle

```
queued → processing → rendered → failed
                    ↘ cancelled
```

| Status | Meaning |
|---|---|
| `queued` | Job created, waiting for worker slot |
| `processing` | Worker picked up the job, pipeline running |
| `rendered` | `.mp4` produced and uploaded to MinIO |
| `failed` | Pipeline error after max retries exceeded |
| `cancelled` | Campaign paused or archived before render started |

---

## Visual Templates (Phase 1)

Phase 1 ships 3 templates. Each is a parameterized FFmpeg composition script.

| Template ID | Style | Duration | Description |
|---|---|---|---|
| `product-review-v1` | review | 30–60s | Talking-head style with product overlay |
| `product-showcase-v1` | entertaining | 15–30s | Fast-cut product images with text overlays |
| `educational-v1` | educational | 45–60s | Slide-by-slide with voiceover |

Template selection: auto-assigned based on `content_style` from Campaign. User can override on the content idea detail page.

---

## Voice Providers (Phase 1)

| Provider | Model | Use Case |
|---|---|---|
| EdgeTTS | `vi-VN-HoaiMyNeural`, `vi-VN-NamMinhNeural` | Free Vietnamese TTS. Default. |
| OmniVoice | 6 Vietnamese voices | Local Vietnamese TTS. Requires GPU for best perf. |
| OpenAI TTS | `tts-1` | Fast, low cost. English-capable. |
| OpenAI TTS | `tts-1-hd` | Higher quality. Pro/Agency tier only. |
| ElevenLabs | Custom voice | Phase 2. Requires user's own API key. |

Voice IDs available in Phase 1:

| Provider | Voice IDs |
|---|---|
| EdgeTTS | `vi-VN-HoaiMyNeural`, `vi-VN-NamMinhNeural` |
| OmniVoice | `ban_mai`, `lan_trinh`, `ngan_ha`, `ngoc_huyen`, `thao_trinh`, `tuong_vy` |
| OpenAI | `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer` |

> **OmniVoice VI voices** sourced from: https://huggingface.co/datasets/STBack23/omnivoice-vi. Place voice profiles in `src/workers/video-engine/voices/<slug>/`.

---

## Business Rules

1. Hard iteration cap: FFmpeg render process is killed after 5 minutes — no unbounded renders
2. Maximum output duration: 60 seconds (TikTok standard feed limit)
3. Minimum output duration: 10 seconds (below this TikTok rejects the upload)
4. Output resolution: 1080×1920 (9:16, TikTok standard). No exceptions in Phase 1.
5. Maximum output file size: 500 MB (TikTok API upload limit)
6. Retry policy: max 3 retries with exponential backoff (30s, 2m, 5m). After 3 failures → status `failed`
7. A `cancelled` job is never retried
8. `script_text` is snapshotted at job creation — the original `content_idea` can be edited without affecting an in-flight render
9. All intermediate files (raw audio, raw frames) are deleted after render completes — only the final `.mp4` is kept
10. A render job cannot be created for a campaign with status `paused`, `completed`, or `archived`
11. Concurrent renders per workspace: Free = 1, Pro = 3, Agency = 10

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `VideoRenderedEvent` | Status → `rendered` | Publishing Engine (create publish job), Campaign (increment `videos_generated`) |
| `VideoRenderFailedEvent` | Status → `failed` after max retries | Campaign (decrement pending count), user notification |

### VideoRenderedEvent Payload

```json
{
  "render_job_id": "uuid",
  "campaign_id": "uuid",
  "tenant_id": "uuid",
  "content_idea_id": "uuid",
  "output_url": "minio://...",
  "thumbnail_url": "minio://...",
  "duration_seconds": 45,
  "caption_text": "...",
  "hashtags": ["#fyp", "#affiliate"],
  "target_accounts": ["uuid"]
}
```

---

## Domain Events Consumed

| Event | Source | Action |
|---|---|---|
| `ContentReadyEvent` | Content Brain | Create `VideoRenderJob` in `queued` status |
| `CampaignPausedEvent` | Campaign | Cancel all `queued` render jobs for that campaign |
| `CampaignArchivedEvent` | Campaign | Cancel all `queued` and `processing` render jobs |

---

## Background Jobs

### VideoRenderWorker
- Trigger: New job in `queued` status (Hangfire queue, not scheduled interval)
- Concurrency: Per-workspace slot limit (see tier limits)
- Process:
  1. Transition job to `processing`
  2. Fetch assets → cache to MinIO if not already there
  3. Call TTS API → generate audio file
  4. Generate subtitle `.srt` by aligning script text to audio timestamps
  5. Build FFmpeg scene plan from template + assets
  6. Run FFmpeg with 5-minute timeout
  7. Quality check: validate duration, resolution, file size
  8. Upload `.mp4` to MinIO
  9. Generate thumbnail (FFmpeg frame extract at 1s mark)
  10. Transition to `rendered`, publish `VideoRenderedEvent`
  11. Clean up intermediate files

### StaleJobCleanupJob
- Schedule: Every hour
- Process: Find jobs stuck in `processing` for > 10 minutes (worker crash) → reset to `queued` or `failed` if retry_count >= 3

---

## API Endpoints

```
GET  /api/v1/video-engine/jobs
     ?campaign_id={uuid}
     ?status=queued|processing|rendered|failed
     ?page={n}&page_size={20}
     → PagedResult<RenderJobSummaryDto>

GET  /api/v1/video-engine/jobs/{id}
     → ApiResponse<RenderJobDetailDto>

POST /api/v1/video-engine/jobs/{id}/cancel
     → ApiResponse

GET  /api/v1/video-engine/templates
     → ApiResponse<VideoTemplate[]>
```

---

## DTOs

### RenderJobSummaryDto
```json
{
  "id", "campaign_id", "status",
  "template_id", "voice_id",
  "duration_seconds", "output_url", "thumbnail_url",
  "retry_count", "error_message",
  "queued_at", "completed_at"
}
```

---

## Acceptance Criteria

### AC-1: Render Triggered Automatically
- [ ] When `ContentReadyEvent` is received, a `VideoRenderJob` is created in `queued` status within 10 seconds
- [ ] Job appears in the campaign's video list immediately with status `queued`

### AC-2: Render Pipeline Completes
- [ ] A rendered video is a valid `.mp4` file, 9:16 aspect ratio, 1080×1920 resolution
- [ ] Duration is between 10 and 60 seconds
- [ ] Video is playable in a standard browser media player (H.264 + AAC)
- [ ] Subtitle is burned into the video or provided as sidecar `.srt` (configurable per template)

### AC-3: Retry on Failure
- [ ] If a render step fails, the job is retried automatically (max 3 times)
- [ ] After 3 failures, status is `failed` and `error_message` contains the failure reason
- [ ] `VideoRenderFailedEvent` is published and user sees a notification

### AC-4: Timeout Enforcement
- [ ] FFmpeg process is killed if it runs longer than 5 minutes
- [ ] Killed renders count as a failure and enter the retry cycle

### AC-5: Cancellation
- [ ] `queued` jobs are cancelled immediately when campaign is paused
- [ ] `processing` jobs are allowed to complete, then the output is not forwarded to Publishing Engine
- [ ] Cancelled jobs do not count toward `videos_generated`

### AC-6: Template Selection
- [ ] Template is auto-selected based on campaign `content_style`
- [ ] User can override template on the content idea page before the job is queued
- [ ] Template list page shows a preview video for each available template

---

## Video Engine v2 — Viral Template Pipeline

This module also supports a second render type: `viral_template`.

The `render_type` field on `VideoRenderJob` controls which pipeline executes:
- `text_to_video` — existing pipeline (unchanged)
- `viral_template` — new pipeline: Character Replacement → Product Replacement → FFmpeg post-processing

New fields added to `VideoRenderJob` for v2:
- `render_type VARCHAR(50)` — default `'text_to_video'`
- `viral_template_id UUID` — FK → viral_templates (required for viral_template type)
- `ai_model_id UUID` — FK → ai_models (required when viral_template.has_human_subject = true)

Full pipeline specification: see `docs/features/character-replacement.md`, `docs/features/product-replacement.md`
Architecture decision: see `docs/decisions/2026-06-22-video-pipeline-v2.md`

---

## Implementation Notes

### Hybrid Architecture

The Video Engine uses a **.NET orchestration + Python sidecar** architecture (see ADR `2026-06-24-video-engine-hybrid-architecture.md`):

- **.NET**: Job management (Hangfire `VideoRenderWorker`), API endpoints (Carter), domain events (MediatR), persistence (EF Core)
- **Python sidecar**: All media processing — TTS generation, video assembly (MoviePy 2.x), subtitle burn-in, final encoding

Communication: .NET calls Python via `Process.Start` with JSON config on stdin. Python writes JSON result to stdout.

### Python Sidecar Location

```
src/workers/video-engine/
├── requirements.txt
├── config.py
├── render_worker.py           ← Entry point (called by .NET)
├── tts_engine.py              ← OmniVoice + edge-tts + OpenAI
├── video_processor.py         ← MoviePy assembly
├── script_parser.py           ← Scene parsing + SRT building
└── voices/                    ← OmniVoice VI profiles
```

### FFmpeg

- FFmpeg must be installed on the worker host. Pin the version in `Dockerfile` — do not use the system package manager version.
- MoviePy 2.x wraps FFmpeg internally — raw FFmpeg calls from .NET are eliminated.
- TTS audio is generated as `.mp3` then converted to `.aac` by FFmpeg during render — do not store intermediate `.mp3`
- Asset URLs passed to FFmpeg must be local file paths (downloaded first) — FFmpeg cannot read from MinIO URLs directly
- The 5-minute hard kill is implemented via `CancellationTokenSource` with `TimeSpan.FromMinutes(5)` passed to the `Process` wrapper — not a Hangfire timeout
- `script_text` snapshot: copy the `content_idea.script` field verbatim at job creation time. This is the source of truth for the render — not the live `content_idea`.
