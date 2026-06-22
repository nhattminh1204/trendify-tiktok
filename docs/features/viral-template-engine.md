# Feature: Viral Template Engine

## Purpose

A library of analyzed TikTok viral video patterns.
The system collects reference viral videos, analyzes their structure — scene composition, transitions, rhythm, motion patterns, and hooks — and produces reusable behavioral templates.

A template is NOT a copied video. It is a behavioral blueprint — the structural DNA of a viral video format — used to drive the Character Replacement and Product Replacement engines.

---

## Concept: Source Video vs Template

| Concept | Description |
|---|---|
| Source Video | A real TikTok viral video stored as reference material |
| Viral Template | The analyzed behavioral blueprint extracted from the source video |
| Template Analysis | Structured JSON describing scene plan, transitions, rhythm, and motion |

The source video is stored only for analysis. The template blueprint is what drives video generation — users never interact with the raw source video.

---

## Entities

### ViralVideoSource

A raw TikTok viral video collected for analysis by the system team.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tiktok_video_id | VARCHAR(200) | Original TikTok video ID |
| tiktok_url | TEXT | Source URL (for reference only) |
| author_handle | VARCHAR(200) | Original creator handle |
| view_count | BIGINT | At time of collection |
| like_count | BIGINT | At time of collection |
| original_duration_seconds | SMALLINT | |
| collected_at | TIMESTAMPTZ | When added to the system |
| processing_status | VARCHAR(50) | 'pending', 'analyzing', 'complete', 'failed' |
| minio_url | TEXT | Cached internal copy (never served externally) |
| created_at | TIMESTAMPTZ | |

### ViralTemplate

The analyzed behavioral blueprint derived from a source video.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| source_video_id | UUID | FK → viral_video_sources. NULL for manually authored templates |
| name | VARCHAR(200) | e.g. "Mirror Selfie Outfit Reveal" |
| description | TEXT | |
| compatible_product_types | TEXT[] | See Product Type taxonomy below |
| video_style | VARCHAR(100) | See Video Style taxonomy below |
| has_human_subject | BOOLEAN | Whether template requires an AI Model selection |
| estimated_duration_seconds | SMALLINT | |
| analysis | JSONB | Full template analysis (see schema below) |
| preview_url | TEXT | MinIO — 3–5 second preview clip |
| thumbnail_url | TEXT | MinIO — static thumbnail |
| is_active | BOOLEAN | Only active templates appear in selection UI |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

## Template Analysis Schema (JSONB)

```json
{
  "hook": {
    "type": "action|question|statement|visual_reveal",
    "duration_seconds": 2,
    "description": "Model enters frame doing a quick spin"
  },
  "scenes": [
    {
      "index": 0,
      "start_seconds": 0.0,
      "end_seconds": 2.5,
      "camera_angle": "medium|closeup|wide|overhead|low_angle",
      "motion_type": "static|pan|zoom_in|zoom_out|handheld|tracking",
      "subject_position": "center|left|right",
      "subject_action": "walking|standing|spinning|dancing|posing|sitting|revealing",
      "product_visibility": "primary|secondary|none"
    }
  ],
  "transitions": {
    "types_used": ["cut", "swipe_left", "zoom_transition", "spin_transition"],
    "avg_scene_duration_seconds": 1.5
  },
  "rhythm": {
    "cuts_per_second": 0.67,
    "music_bpm": 128,
    "sync_to_beat": true,
    "energy_level": "high|medium|low"
  },
  "layout": {
    "text_overlay": true,
    "text_positions": ["top_third", "bottom_third"],
    "product_focus_seconds": [{"start": 1.5, "end": 3.0}]
  },
  "motion_patterns": {
    "dominant_movement": "catwalk|side_step|spin|bounce|static_pose|reveal",
    "pose_sequence_count": 4,
    "requires_full_body": true,
    "requires_face": true
  }
}
```

---

## Product Type Taxonomy

System-defined product types that drive template filtering and workflow selection.

| product_type value | Covers |
|---|---|
| `fashion_female` | Tops, dresses, skirts, pants, bikini, sportswear (women) |
| `fashion_male` | Tops, pants, outerwear, sportswear (men) |
| `watch` | Wristwatches, smartwatches |
| `handbag` | Bags, purses, backpacks, clutches |
| `cosmetics` | Makeup, skincare, perfume |
| `jewelry` | Necklaces, bracelets, earrings, rings |
| `footwear` | Shoes, sneakers, heels, boots |

---

## Video Style Taxonomy

| video_style value | Description | Compatible Product Types |
|---|---|---|
| `catwalk` | Model walks forward on a path | fashion_female, fashion_male, footwear |
| `outfit_showcase` | Full outfit display, multiple angles, slow rotation | fashion_female, fashion_male |
| `mirror_selfie` | Filming self in mirror | fashion_female, fashion_male, handbag |
| `transition_outfit` | Before/after outfit change cut | fashion_female, fashion_male |
| `try_on` | Putting the product on | fashion_female, fashion_male, footwear, watch, jewelry |
| `viral_dance` | Dancing while wearing/holding product | fashion_female, fashion_male |
| `closeup_detail` | Macro/detail shots of product surface | watch, jewelry, handbag, cosmetics |
| `on_wrist_on_body` | Product worn on body part (no full model) | watch, jewelry |
| `luxury_cinematic` | Slow, cinematic reveal, dramatic lighting | watch, handbag, jewelry |
| `slow_motion_reveal` | Slow motion product drop or reveal | watch, handbag, jewelry |
| `lifestyle_carry` | Product used in natural everyday setting | handbag, footwear |
| `fashion_match` | Coordinating product with outfit | handbag, footwear, jewelry |
| `before_after` | Split screen or sequential before/after | cosmetics |
| `product_review` | Direct-to-camera review monologue | cosmetics, watch, handbag |
| `makeup_routine` | Step-by-step application | cosmetics |
| `tutorial` | Instructional demonstration | cosmetics, footwear |

---

## Product Type → Workflow Routing

When a user selects a product, the system infers `product_type` from `product.category` and surfaces only templates where `compatible_product_types` contains that value.

```
product.category  →  product_type  →  compatible viral templates
```

Category-to-type mapping is a configuration table (not hardcoded). Phase 1 ships 30 default mappings covering TikTok Shop's top categories.

---

## Business Rules

1. Source videos are stored internally — they are never served directly to workspace users
2. A template with `is_active = false` does not appear in selection UI
3. Templates are system-level resources — no `tenant_id`. All workspaces share the same template library.
4. Phase 1: Template library is manually curated by the system team. No auto-ingestion from TikTok API.
5. Phase 1 launch target: minimum 20 active templates covering all product types
6. Templates with `has_human_subject = false` do not require an AI Model (e.g., pure product closeup styles)
7. Every active template must have a complete `analysis` JSON — no null fields — before `is_active` can be set to true
8. Each template must have at least one `compatible_product_types` value before activation
9. The `analysis` JSON is treated as immutable once the template is active — changes require creating a new template version
10. Preview clips are generated from the source video: first 4 seconds, re-encoded at 480×854 (reduced resolution for fast loading)

---

## Background Jobs

### ViralVideoAnalysisJob
- Trigger: Manual — admin triggers analysis on a collected source video (via admin endpoint)
- Process:
  1. Download source video from MinIO
  2. Run scene detection (FFmpeg scene filter: `select='gt(scene,0.3)'`)
  3. Sample frames at 2 fps, run MediaPipe Pose on each sampled frame
  4. Run audio analysis — detect BPM via the `aubio` library (Python sidecar)
  5. Generate structured `analysis` JSON draft
  6. Generate preview clip (first 4 seconds, re-encoded to 480×854)
  7. Generate thumbnail (frame at 1 second mark)
  8. Create `ViralTemplate` record with `is_active = false` for human review and completion
- Note: Automated analysis produces a draft. A human curator reviews and corrects the draft before activation.

---

## API Endpoints

```
GET  /api/v1/viral-templates
     ?product_type=fashion_female|watch|handbag|cosmetics|...
     ?video_style=catwalk|mirror_selfie|...
     ?has_human_subject=true|false
     ?page={n}&page_size={20}
     → PagedResult<ViralTemplateSummaryDto>

GET  /api/v1/viral-templates/{id}
     → ApiResponse<ViralTemplateDetailDto>

GET  /api/v1/viral-templates/product-types
     → ApiResponse<ProductTypeMappingDto[]>
     (returns the category → product_type mapping table)
```

---

## DTOs

### ViralTemplateSummaryDto
```json
{
  "id", "name", "video_style",
  "compatible_product_types", "has_human_subject",
  "estimated_duration_seconds",
  "thumbnail_url", "preview_url"
}
```

### ViralTemplateDetailDto
```json
{
  "id", "name", "description", "video_style",
  "compatible_product_types", "has_human_subject",
  "estimated_duration_seconds",
  "analysis": { ... },
  "thumbnail_url", "preview_url"
}
```

### ProductTypeMappingDto
```json
{
  "category": "Váy & Đầm",
  "product_type": "fashion_female"
}
```

---

## Acceptance Criteria

### AC-1: Template Discovery
- [ ] User can browse templates filtered by the product type of their selected product
- [ ] Each card shows: thumbnail, preview clip (on hover), video style label, duration
- [ ] Templates with `has_human_subject = false` display a "No model needed" badge
- [ ] Minimum 20 active templates available at launch

### AC-2: Product Type Filtering
- [ ] Selecting a watch product shows only watch-compatible templates
- [ ] Selecting a fashion female product shows only fashion-compatible templates
- [ ] Incompatible templates are hidden — not disabled
- [ ] An empty state message is shown when no templates match the selected product type

### AC-3: Template Analysis Completeness
- [ ] Every active template has a complete `analysis` JSON with no null fields
- [ ] Scene count in analysis matches visible transitions in the preview clip (±1)
- [ ] `estimated_duration_seconds` is within ±3 seconds of actual source video duration

---

## Implementation Notes

- Phase 1: All template analysis is human-curated. The `ViralVideoAnalysisJob` produces a draft; a curator fills in gaps and activates the template.
- Phase 1: Source videos are downloaded manually from TikTok by the team and uploaded to MinIO directly — no API crawling
- Scene detection command: `ffmpeg -i input.mp4 -vf "select='gt(scene,0.4)',showinfo" -vsync vfr -f null -`
- Preview clip generation: `ffmpeg -ss 0 -t 4 -i input.mp4 -vf scale=480:854 -c:v libx264 -c:a aac -b:a 64k preview.mp4`
- BPM detection: Python sidecar using `aubio.tempo`. Returns float BPM value.
- MediaPipe Pose runs on CPU at 2 fps sampling rate — sufficient for pose sequence capture without GPU
- Category-to-product-type mapping is stored in a database table `product_type_mappings` (seeded at migration time) to allow admin editing without code changes
