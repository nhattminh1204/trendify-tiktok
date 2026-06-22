# Feature: Content Brain + Content Factory Module

Two sub-modules in one feature doc. Content Brain handles ideas and scripts. Content Factory handles production and assets.

---

## Content Brain

### Purpose
AI-powered system for generating content ideas, hooks, scripts, and CTAs based on trends, audience data, and historical performance.

### Entities

#### ContentIdea

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| campaign_id | UUID | FK → campaigns. Null for standalone ideas. |
| product_id | UUID | FK → products. Null for non-affiliate ideas. |
| title | VARCHAR(500) | One-line summary |
| description | TEXT | Expanded concept |
| hook | TEXT | Opening line / hook |
| script | TEXT | Full video script |
| cta | TEXT | Spoken call to action (end of script) |
| caption | TEXT | TikTok post caption (separate from script) |
| hashtags | TEXT[] | Array of hashtag strings (without #) |
| estimated_duration_seconds | SMALLINT | Estimated video duration based on word count |
| niche | VARCHAR(255) | |
| target_persona_id | UUID | FK → audience_personas |
| trend_id | UUID | FK → trend_detections (optional) |
| status | VARCHAR(50) | 'draft', 'approved', 'ready', 'in_production', 'published', 'archived' |
| generated_by_ai | BOOLEAN | |
| created_by_user_id | UUID | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### Idea Status Flow
```
draft → approved → ready → in_production → published
draft → archived (skipped)
approved → archived (skipped)
```

| Status | Meaning |
|---|---|
| `draft` | AI-generated or user-created. Not yet reviewed. |
| `approved` | User confirmed the script is good. Caption + hashtags generated. |
| `ready` | Caption and hashtags confirmed. `ContentReadyEvent` published. Video Engine picks this up. |
| `in_production` | Video Engine has created a render job for this idea. |
| `published` | Video has been published to TikTok. Immutable. |
| `archived` | Skipped or deleted. Hidden from default views. |

### Business Rules (Content Brain)

1. Idea generation is tied to AI cost budget — check budget before calling AI
2. Generating a full script from scratch uses `Premium` AI tier
3. Hook and CTA use `Micro` tier
4. A trend_id on an idea means the idea was inspired by a detected trend
5. Ideas in `published` status are immutable — linked to an Analytics post record
6. Batch idea generation: max 10 ideas per API call
7. Improvement recommendations from Learning Engine are injected as context in idea generation
8. `estimated_duration_seconds` is calculated as: `word_count / 2.5` (average spoken words per second). If result is outside 10–60s range, the idea is flagged with a warning — not blocked
9. When `campaign_id` is set, product context is always injected into AI prompts (see Affiliate Generation section)
10. User-edited fields (`script`, `caption`, `hashtags`) are never re-overwritten by AI without explicit user action
11. The `notes` field from Campaign must never be passed to AI prompts — internal use only

### AI Prompts Used

| Operation | Prompt Slug | Tier |
|---|---|---|
| Generate ideas | `content-brain.idea-generation` | Standard |
| Generate hook | `content-brain.hook-generation` | Micro |
| Generate script (short) | `content-brain.script-short` | Standard |
| Generate script (long) | `content-brain.script-long` | Premium |
| Generate CTA | `content-brain.cta-generation` | Micro |
| Generate strategy | `content-brain.strategy-generation` | Premium |
| Generate affiliate ideas | `content-brain.affiliate-idea-generation` | Standard |
| Generate affiliate script | `content-brain.affiliate-script` | Premium |
| Generate caption | `content-brain.caption-generation` | Micro |
| Generate hashtags | `content-brain.hashtag-generation` | Micro |

---

### Affiliate Content Generation

This section covers generation triggered by a Campaign — all ideas linked to a `campaign_id` and `product_id`.

#### Trigger

`CampaignActivatedEvent` → `ContentGenerationJob` → generate initial batch of ideas.

Initial batch size = `min(videos_target, 5)`. Subsequent batches are generated as the queue drains (when `ideas in 'ready' status < 3` for a campaign).

#### Product Context Injection

Every AI call for an affiliate idea injects a sanitized product context block:

```
PRODUCT CONTEXT (read-only, do not repeat verbatim):
- Name: {product.name}
- Category: {product.category}
- Price: {product.price} {product.currency}
- Commission: {product.commission_rate}%
- Key benefit: {product.description — first 200 chars only}
```

**Prompt injection prevention:**
- `product.name`, `product.description` are HTML-stripped and truncated before injection
- Injection uses a structured delimiter that the model cannot close: `--- PRODUCT CONTEXT START ---` / `--- PRODUCT CONTEXT END ---`
- User-editable fields (campaign `notes`, custom audience notes) are never injected into AI prompts

#### Content Style → Prompt Mapping

| Campaign `content_style` | Prompt Slug | Script Structure |
|---|---|---|
| `review` | `affiliate-script-review` | Problem → Product intro → Features → Verdict → CTA |
| `educational` | `affiliate-script-educational` | Hook question → Teach tip → Product as solution → CTA |
| `entertaining` | `affiliate-script-entertaining` | Relatable scenario → Surprise reveal → Product → CTA |
| `ugc` | `affiliate-script-ugc` | Personal story → Product discovery → Result → CTA |
| `comparison` | `affiliate-script-comparison` | Before/without → After/with product → Price anchor → CTA |

#### Caption Generation

Triggered automatically when a script is approved (status → `approved`).

Caption structure:
```
{2–3 sentence hook matching the video hook}

👉 Link in bio

{3–5 benefit keywords as plain text}
```

Caption must not exceed 2200 characters (TikTok limit). AI is instructed to stay under 300 characters for Phase 1 safety margin.

Caption is generated in the same language as the script. Default: Vietnamese (configurable per workspace).

#### Hashtag Generation

Triggered alongside caption generation.

Output: array of 5–15 hashtag strings (without `#`).

Composition rule:
- 2–3 trending hashtags (injected from Trend Intelligence if available)
- 2–3 product/category hashtags (derived from `product.category`)
- 2–3 niche audience hashtags (derived from persona)
- 1–2 broad reach hashtags (`fyp`, `viral`, `xuhuong`)

Hashtags are stored as `TEXT[]` in `content_ideas.hashtags`. They are joined with spaces and appended to caption in the Publishing Engine.

#### Duration Estimation

After script generation:
```
word_count = script.split(' ').length
estimated_duration_seconds = round(word_count / 2.5)
```

If `estimated_duration_seconds < 10`: flag idea with warning `SCRIPT_TOO_SHORT`
If `estimated_duration_seconds > 60`: flag idea with warning `SCRIPT_TOO_LONG`

Warnings are shown in the UI — user can edit the script to adjust. The idea is not blocked from approval.

### Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `ContentIdeaCreatedEvent` | Idea added (AI or manual) | — |
| `ContentIdeaApprovedEvent` | Status → `approved` | Caption + hashtag generation (auto-triggered) |
| `ContentReadyEvent` | Status → `ready` | Video Engine (create render job) |
| `ContentIdeaPublishedEvent` | Status → `published` | Analytics (begin tracking), Learning (record metadata) |

### ContentReadyEvent Payload

```json
{
  "content_idea_id": "uuid",
  "campaign_id": "uuid",
  "tenant_id": "uuid",
  "script": "string",
  "caption": "string",
  "hashtags": ["string"],
  "estimated_duration_seconds": 35,
  "target_accounts": ["uuid"]
}
```

`target_accounts` is copied from the Campaign at event publish time — Content Brain reads this from the Campaign record.

### Domain Events Consumed

| Event | Source | Action |
|---|---|---|
| `CampaignActivatedEvent` | Campaign | Trigger `ContentGenerationJob` for initial batch |
| `CampaignPausedEvent` | Campaign | Cancel any queued `ContentGenerationJob` for that campaign |

### Background Jobs

#### ContentGenerationJob
- Trigger: `CampaignActivatedEvent` (via Outbox), or when `ready ideas < 3` for an active campaign
- Hard cap: max 10 AI calls per job run — no unbounded generation loops
- Process:
  1. Load campaign (product, content_style, audience_persona, videos_target)
  2. Load top 3 improvement recommendations from Learning Engine for this workspace
  3. Load top trending hashtags from Trend Intelligence (up to 5)
  4. Call AI with affiliate prompt → generate up to 5 ideas
  5. For each idea: calculate `estimated_duration_seconds`, flag if out of range
  6. Save ideas with `status = 'draft'`, linked to `campaign_id` and `product_id`

#### CaptionHashtagGenerationJob
- Trigger: `ContentIdeaApprovedEvent`
- Process:
  1. Load approved idea + product context
  2. Call AI for caption (Micro tier)
  3. Call AI for hashtags (Micro tier) — parallel calls
  4. Save `caption` and `hashtags` to idea
  5. Transition idea status to `ready`
  6. Publish `ContentReadyEvent`

#### QueueRefillCheckJob
- Schedule: Every 10 minutes
- Process: For each active campaign, count ideas in `ready` or `draft` status. If count < 3 and `videos_generated < videos_target`, enqueue `ContentGenerationJob`.

---

## Content Factory

### Purpose
Manages the production pipeline — turning approved ideas into publishable content assets (audio, subtitles, media).

### Entities

#### ContentPipeline
A reusable workflow definition that processes a content idea into production assets.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| name | VARCHAR(255) | e.g. "Standard TikTok Pipeline" |
| steps | JSONB | Ordered list of step configurations |
| is_active | BOOLEAN | |

Example `steps` JSONB:
```json
[
  { "type": "voice_generation", "provider": "elevenlabs", "voice_id": "abc123" },
  { "type": "subtitle_generation", "language": "en" },
  { "type": "notify_complete" }
]
```

#### ContentPipelineRun

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| pipeline_id | UUID | FK → content_pipelines |
| idea_id | UUID | FK → content_ideas |
| status | VARCHAR(50) | 'pending', 'running', 'completed', 'failed' |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| error_message | TEXT | |

#### ContentAsset

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| idea_id | UUID | FK → content_ideas |
| asset_type | VARCHAR(50) | 'video', 'audio', 'subtitle', 'thumbnail' |
| storage_key | VARCHAR(1000) | MinIO object key |
| file_size_bytes | BIGINT | |
| duration_seconds | DECIMAL(10,2) | For audio/video |
| mime_type | VARCHAR(100) | |

### Business Rules (Content Factory)

1. Only one pipeline run active per idea at a time — parallel runs rejected with `409 PIPELINE_RUNNING`
2. Content assets are stored in MinIO, never in PostgreSQL
3. Assets are NOT auto-deleted when an idea is archived — must be manually deleted
4. Voice generation uses ElevenLabs API (configurable per workspace)
5. Subtitle generation uses OpenAI Whisper API
6. Pipeline steps are executed sequentially in a Hangfire background job
7. On step failure: mark run as `failed`, log error, notify user — do NOT retry automatically without user action

### Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `PipelineRunCompletedEvent` | Run → completed | — (notify user) |
| `ContentAssetCreatedEvent` | New asset stored | — |

---

## Acceptance Criteria

### AC-1: AI Idea Generation (Standalone)
- [ ] User selects a trend → clicks "Generate Ideas" → sees 5 ideas within 30 seconds
- [ ] Each idea shows title, hook, and brief description
- [ ] User can regenerate if unsatisfied
- [ ] If AI budget exceeded, clear message shown (not a 500 error)

### AC-2: Script Generation
- [ ] User selects an idea → clicks "Generate Script"
- [ ] Full script shown within 60 seconds
- [ ] Script broken into sections: Hook, Body, CTA
- [ ] User can edit each section inline
- [ ] `estimated_duration_seconds` is displayed below the script with a warning if outside 10–60s range

### AC-3: Idea Board
- [ ] Ideas displayed in Kanban-style columns (Draft / Approved / Ready / In Production / Published)
- [ ] Drag-and-drop to change status (Draft ↔ Approved only — others via explicit actions)
- [ ] Filtering by campaign, niche, persona, trend, date

### AC-4: Campaign-Driven Affiliate Generation
- [ ] When a campaign is activated, the first batch of 5 ideas is generated within 2 minutes
- [ ] Each generated idea references the campaign's product (name + commission shown on the card)
- [ ] Script structure matches the campaign's `content_style` (review/educational/entertaining/ugc/comparison)
- [ ] Queue refill: when `ready ideas < 3` for an active campaign, new ideas are auto-generated within 10 minutes

### AC-5: Caption & Hashtag Generation
- [ ] When user approves an idea, caption and hashtags are generated automatically (no extra click)
- [ ] Caption is shown in a separate field from the script — user can edit before it goes to `ready`
- [ ] Hashtag list is shown as individual chips — user can remove or add tags before confirming
- [ ] Confirming caption + hashtags transitions idea to `ready` status

### AC-6: Prompt Injection Prevention
- [ ] Product name and description are sanitized (HTML stripped, truncated to 200 chars) before AI injection
- [ ] Campaign `notes` field never appears in any AI prompt — verified by code review
- [ ] AI-generated output is stored as-is — no server-side execution of generated content

### AC-4: Production Pipeline
- [ ] User selects an approved idea → selects a pipeline → starts run
- [ ] Progress visible in real-time (polling every 3 seconds)
- [ ] On completion: assets available for download
- [ ] On failure: error message with retry button

### AC-5: Asset Management
- [ ] Assets listed per idea
- [ ] Download URL is pre-signed, expires in 1 hour
- [ ] User can delete individual assets
- [ ] Total storage usage shown in workspace settings

---

## Implementation Notes

- `ContentPipelineJob` is a Hangfire background job — one job per pipeline run
- MinIO pre-signed URLs generated with 1-hour expiry — never expose permanent URLs
- Voice generation and subtitle generation are wrapped in `IVoiceProvider` and `ISubtitleProvider` interfaces for swappability
- Script generation prompt injects: persona pain points, trend context, and top performing previous scripts from Learning Engine
