# ADR: Video Generation Pipeline v2 — Viral Template Based

Date: 2026-06-22
Status: Accepted

---

## Context

The existing Video Engine (v1) generates video from text:
```
Script + Product Images → TTS → FFmpeg composition → .mp4
```

This pipeline serves creators who want original voiceover videos with product imagery.

The product vision requires a second, fundamentally different pipeline:
```
Viral Template Video → Character Replacement → Product Replacement → .mp4
```

This pipeline takes existing viral video patterns and produces new videos by replacing the human subject and the featured product, preserving the viral format's behavioral structure.

---

## Decision

Extend the `VideoRenderJob` entity with a `render_type` discriminator field to support two distinct pipelines sharing the same job table, status lifecycle, and output contract.

| render_type | Description |
|---|---|
| `text_to_video` | Existing pipeline. Script + product images → FFmpeg. |
| `viral_template` | New pipeline. Viral template → Character Replacement → Product Replacement → FFmpeg post-processing. |

Both pipelines produce the same output: an `.mp4` stored in MinIO, emitting `VideoRenderedEvent` on completion.

---

## Schema Change: video_render_jobs

Add three fields to the existing table:

| Field | Type | Default | Notes |
|---|---|---|---|
| render_type | VARCHAR(50) | 'text_to_video' | Discriminator. Never null. |
| viral_template_id | UUID | NULL | FK → viral_templates. Required when render_type = 'viral_template'. |
| ai_model_id | UUID | NULL | FK → ai_models. Required when viral_template.has_human_subject = true. |

Existing rows remain valid with `render_type = 'text_to_video'`.

Database migration: `00002_VideoRenderJobV2.sql`

---

## Viral Template Pipeline: Full Execution Flow

```
User submits: product_id + viral_template_id + ai_model_id (optional)
      ↓
VideoRenderJob created (render_type: viral_template)
      ↓
[Step A] CharacterReplacementJob  (conditional)
   Condition: viral_template.has_human_subject = true
              AND ai_model_id IS NOT NULL
   Input:  viral template source video
   Output: character-replaced video
   Trigger next step via: CharacterReplacementCompleteEvent
      ↓  (or skip directly to Step B if condition false)
[Step B] ProductReplacementJob
   Input:  video from Step A (or template source if Step A skipped)
   Output: product-replaced video
   Trigger next step via: ProductReplacementCompleteEvent
      ↓
[Step C] Post-Processing (FFmpeg, local CPU)
   — Add TTS audio track (optional, from content_idea.script if provided)
   — Burn in subtitle/caption overlay (from render_job.caption_text)
   — Add background music (optional, synced to template.analysis.rhythm.music_bpm)
   — Re-encode to 1080×1920, H.264 + AAC
      ↓
[Step D] Quality check and MinIO upload
      ↓
VideoRenderedEvent emitted (same as text_to_video pipeline)
```

---

## User Flow

```
1. User selects a product
      ↓
2. System infers product_type from product.category
      ↓
3. User selects a viral template
   (filtered by compatible_product_types matching product_type)
      ↓
4. If template.has_human_subject = true:
      User selects an AI Model from the library
   If template.has_human_subject = false:
      Model selection is skipped
      ↓
5. User clicks "Generate"
      ↓
6. System creates VideoRenderJob (render_type: viral_template)
      ↓
7. Pipeline executes automatically
   CharacterReplacement → ProductReplacement → PostProcessing
      ↓
8. User notified when video is ready
```

---

## Pipeline Branching Logic in VideoRenderWorker

```
if (job.render_type == "text_to_video")
    → run existing TTS + FFmpeg pipeline (unchanged)

if (job.render_type == "viral_template")
    template = load viral_template(job.viral_template_id)

    if (template.has_human_subject && job.ai_model_id != null)
        create CharacterReplacementJob → wait for CharacterReplacementCompleteEvent

    else
        // skip character replacement
        create ProductReplacementJob directly
        wait for ProductReplacementCompleteEvent

    // ProductReplacementCompleteEvent handler:
    run post-processing FFmpeg steps
    upload final .mp4
    emit VideoRenderedEvent
```

---

## New Hangfire Queues

| Queue | Handler | Purpose |
|---|---|---|
| `character-replacement` | CharacterReplacementWorker | Character replacement jobs |
| `product-replacement` | ProductReplacementWorker | Product replacement jobs |
| `video-render` | VideoRenderWorker (existing) | Both text_to_video and viral_template final steps |

Separate queues enable independent concurrency controls and monitoring per step.

---

## Concurrency and Timeout Summary

| Step | Timeout | Max Retries | Concurrency (Free/Pro/Agency) |
|---|---|---|---|
| CharacterReplacementJob | 10 minutes | 2 | 1 / 2 / 5 |
| ProductReplacementJob | 15 minutes | 2 | 1 / 2 / 5 |
| Post-processing (FFmpeg) | 5 minutes | 3 | 1 / 3 / 10 |

---

## Consequences

1. `video_render_jobs` table needs migration (`00002_VideoRenderJobV2.sql`) for three new fields
2. `VideoRenderWorker` Hangfire job branches on `render_type` — existing text_to_video path is unchanged
3. Two new Hangfire workers: `CharacterReplacementWorker`, `ProductReplacementWorker`
4. Two new Hangfire queues: `character-replacement`, `product-replacement`
5. New feature docs required (completed):
   - `docs/features/ai-model-library.md`
   - `docs/features/viral-template-engine.md`
   - `docs/features/character-replacement.md`
   - `docs/features/product-replacement.md`
6. Python sidecar service `ai-worker` required (see ADR `2026-06-22-open-source-ai-stack.md`)
7. The viral_template pipeline is Phase 2 — text_to_video (Phase 1) ships first unaffected
8. `VideoRenderedEvent` payload is identical for both render types — Publishing Engine requires no changes
