# Feature: Product Replacement Engine

## Purpose

Detects the original product in a video, removes it, and composites the affiliate product image in its place.
The engine preserves scene composition, lighting, and motion context — only the featured product is swapped.

---

## Concept

```
Input:
  Video (character-replaced, or source template if no character)
  +
  Affiliate product images
      ↓
Process:
  1. Detect the original product's location in each video frame
  2. Segment (mask) the detected product
  3. Inpaint the background behind the removed product
  4. Composite the affiliate product image onto the inpainted area per frame
Output:
  Video — same composition, same motion — affiliate product replaces original
```

---

## When This Engine Runs

This engine always runs as part of the `viral_template` render pipeline. It is the final AI step before post-processing.

Input video is:
- Output of `CharacterReplacementJob` if `has_human_subject = true`
- Original viral template source video if `has_human_subject = false`

---

## Entities

### ProductReplacementJob

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| render_job_id | UUID | FK → video_render_jobs |
| source_video_url | TEXT | MinIO — input video (from CharacterReplacement output or template source) |
| product_id | UUID | FK → products |
| status | VARCHAR(50) | 'queued', 'processing', 'complete', 'failed', 'skipped' |
| detection_provider | VARCHAR(100) | 'grounding_dino_replicate', 'grounding_dino_local', 'openai_vision' |
| segmentation_provider | VARCHAR(100) | 'sam2_replicate', 'sam2_local' |
| inpainting_provider | VARCHAR(100) | 'stability_inpaint', 'flux_inpaint_replicate', 'comfyui_local' |
| detected_frames_count | SMALLINT | Number of frames where product was detected with confidence ≥ 0.5 |
| total_sampled_frames | SMALLINT | Total frames sampled for detection |
| detection_data_url | TEXT | MinIO — per-frame bounding boxes JSON. Retained 7 days. |
| output_video_url | TEXT | MinIO — product-replaced video |
| processing_duration_ms | INT | |
| failure_reason | VARCHAR(100) | 'PRODUCT_NOT_DETECTABLE', 'SEGMENTATION_ERROR', 'INPAINT_ERROR', 'TIMEOUT', 'MAX_RETRIES' |
| error_message | TEXT | |
| retry_count | SMALLINT | Max 2 |
| queued_at | TIMESTAMPTZ | |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

---

## Processing Pipeline

```
1. Load source video from MinIO
2. Pre-check: verify product.thumbnail_url exists — fail immediately if null

3. Object Detection (sampled at 4 fps)
   — Run GroundingDINO with text prompt derived from product type
   — Per frame: return bounding box + confidence score
   — Filter frames where confidence < 0.5
   — If detected_frames / total_sampled_frames < 0.30 → PRODUCT_NOT_DETECTABLE → fail immediately (no retry)
   — Store detected_frames_count, total_sampled_frames
   — Store per-frame bounding box data as detection_data JSON in MinIO

4. Segmentation (frames where detection confidence ≥ 0.5)
   — Run SAM2 with bounding boxes as prompts
   — Output: per-frame binary mask of original product

5. Background Inpainting (per masked frame)
   — Apply mask to remove original product from frame
   — Run inpainting model to fill background
   — Product area becomes clean background

6. Product Compositing (FFmpeg + OpenCV, CPU)
   — Load product.thumbnail_url from MinIO
   — Per frame:
     a. Resize product image to match detected bounding box dimensions
     b. Apply perspective transform to match scene angle (4-point estimation from bounding box)
     c. Apply brightness/contrast match to surrounding area (histogram equalization)
     d. Composite product onto inpainted frame
   — Render all composited frames back to video via FFmpeg

7. Quality Validation
   — Product visible in at least 70% of originally-detected frames
   — No black-box artifacts at product boundaries (edge gradient check)
   — If validation fails → retry (max 2 retries)

8. Store output_video_url in MinIO
9. Publish ProductReplacementCompleteEvent
```

---

## Detection Prompt by Product Type

Text prompt passed to GroundingDINO. Constructed at runtime from `product.product_type` and `product.name`.

| product_type | Base Prompt | Refined With |
|---|---|---|
| `fashion_female` | Product name prefix (first 3 words, e.g., "a floral dress") | product.name |
| `fashion_male` | Product name prefix | product.name |
| `watch` | "a wristwatch" | — |
| `handbag` | "a handbag" | — |
| `cosmetics` | "a lipstick" / "a foundation" / "a skincare bottle" | inferred from product.name |
| `jewelry` | "a necklace" / "a bracelet" | inferred from product.name |
| `footwear` | "shoes" / "sneakers" / "heels" | inferred from product.name |

Product name and category values are HTML-stripped and truncated to 30 characters before use as prompts (prompt injection prevention).

---

## Detection Confidence Rules

| Condition | Action |
|---|---|
| Frame confidence ≥ 0.5 | Include frame in segmentation and compositing |
| Frame confidence < 0.5 | Skip frame — no compositing on this frame |
| Detected frames < 30% of total sampled | `PRODUCT_NOT_DETECTABLE` — fail immediately, no retry |
| Final composited product frames < 70% of detected frames | Quality check failed — retry |

When `PRODUCT_NOT_DETECTABLE` is returned, the user sees:
> "We could not locate the product in this video. Try selecting a different template where the featured product is more visible."

This failure is NOT counted against the user's render job limit.

---

## Provider Stack

All providers abstracted behind interfaces in `src/shared/`.

| Step | Phase 1 (Cloud) | Phase 2 (Self-hosted) |
|---|---|---|
| Object detection | Replicate API — GroundingDINO | GroundingDINO local (Docker, CPU) |
| Video segmentation | Replicate API — SAM2 | SAM2 local (Docker, GPU) |
| Background inpainting | Stability AI Inpainting API | FLUX.1 Inpaint via ComfyUI |
| Perspective transform + compositing | FFmpeg + OpenCV (local CPU) | FFmpeg + OpenCV (local CPU) |

Compositing (Step 6) always runs locally via FFmpeg and OpenCV — no external API required.

---

## Business Rules

1. ProductReplacementJob always runs as part of the viral_template pipeline — never standalone
2. Job is created after `CharacterReplacementCompleteEvent` (or directly if no character replacement)
3. `product.thumbnail_url` must be non-null at job creation time — creation is rejected with `PRODUCT_IMAGE_MISSING` otherwise
4. `PRODUCT_NOT_DETECTABLE` failure does not count as a retry — it is an immediate terminal state
5. All other failures follow retry logic: max 2 retries with 60-second delay between retries
6. Hard timeout: entire pipeline killed after 15 minutes (CancellationTokenSource)
7. All intermediate files (masks, inpainted frames) are deleted immediately after output video is produced
8. `detection_data_url` (bounding box JSON) is retained 7 days then deleted by cleanup job
9. Costs for detection, segmentation, and inpainting are each logged separately to `AIUsageLog`
10. Concurrency limits per workspace: Free = 1, Pro = 2, Agency = 5

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `ProductReplacementCompleteEvent` | status → complete | Video Engine (proceed to post-processing: audio + subtitles + final encode) |
| `ProductReplacementFailedEvent` | status → failed | VideoRenderJob (mark render job failed), user notification |
| `ProductNotDetectableEvent` | status → failed, reason = PRODUCT_NOT_DETECTABLE | User notification (different message — not a system error) |

### ProductReplacementCompleteEvent Payload
```json
{
  "product_replacement_job_id": "uuid",
  "render_job_id": "uuid",
  "tenant_id": "uuid",
  "output_video_url": "minio://...",
  "duration_seconds": 28
}
```

---

## Domain Events Consumed

| Event | Source | Action |
|---|---|---|
| `CharacterReplacementCompleteEvent` | Character Replacement Engine | Create ProductReplacementJob with character-replaced video as source |
| `VideoRenderJobCreatedEvent` (render_type: viral_template, has_human_subject: false) | Video Engine | Create ProductReplacementJob directly with template source video |

---

## Background Jobs

### ProductReplacementWorker
- Trigger: Job in `queued` status (Hangfire queue `product-replacement`)
- Concurrency: per-workspace slot enforcement (see Business Rule 10)
- Process: execute the 9-step Processing Pipeline above

### DetectionDataCleanupJob
- Schedule: Daily at 03:00
- Process: Delete `detection_data_url` files from MinIO where `completed_at < NOW() - 7 days`

---

## API Endpoints

```
GET  /api/v1/product-replacement/jobs/{render_job_id}
     → ApiResponse<ProductReplacementJobDto>
```

This engine is invoked internally via domain events. Endpoint is for UI status polling only.

---

## DTOs

### ProductReplacementJobDto
```json
{
  "id", "render_job_id", "product_id",
  "status", "failure_reason",
  "detection_provider", "segmentation_provider", "inpainting_provider",
  "detected_frames_count", "total_sampled_frames",
  "output_video_url",
  "processing_duration_ms", "error_message",
  "retry_count",
  "queued_at", "completed_at"
}
```

---

## Acceptance Criteria

### AC-1: Product Replaced in Output
- [ ] Output video shows the affiliate product in approximately the same position as the original
- [ ] Original product is no longer visible
- [ ] Affiliate product appears in at least 70% of frames where the original was detected

### AC-2: Detection Failure Handling
- [ ] When product detected in < 30% of frames, user sees `PRODUCT_NOT_DETECTABLE` message
- [ ] Suggested action (try different template) is displayed
- [ ] This failure is NOT counted against the user's render limit

### AC-3: Compositing Visual Quality
- [ ] Product image is perspective-corrected to match the scene angle
- [ ] No hard rectangular artifact border around composited product
- [ ] Product size is proportional to its apparent size in the original video

### AC-4: Cost Tracking
- [ ] Detection, segmentation, and inpainting costs each logged to AIUsageLog separately
- [ ] Total product replacement cost visible on render job detail page

---

## Implementation Notes

- GroundingDINO via Replicate: `POST https://api.replicate.com/v1/models/idea-research/grounding-dino/predictions`
  - Input: `{ "image": base64_frame, "query": "a wristwatch" }`
  - Output: `{ "boxes": [[x1,y1,x2,y2]], "scores": [0.87], "labels": ["a wristwatch"] }`
- SAM2 via Replicate: model `meta/sam-2`
  - Input: image frame + bounding box prompt
  - Output: binary mask PNG
- Stability AI Inpainting: `POST https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image/masking`
  - Input: original frame + mask + prompt "clean background, seamless"
- Perspective transform: OpenCV `getPerspectiveTransform`. 4 corner points derived from detected bounding box.
- Lighting match: OpenCV `createCLAHE` applied to product image channels to match mean/std of surrounding inpainted region.
- Frame extraction for detection: `ffmpeg -i video.mp4 -vf fps=4 frames/frame_%04d.jpg`
- Final composited video re-encoded: `ffmpeg -framerate 30 -i frames/frame_%04d.jpg -c:v libx264 -pix_fmt yuv420p output.mp4`
- Interface definitions in `src/shared/`:
  ```
  IObjectDetectionProvider  → Detect(frame_url, prompt) → BoundingBoxResult[]
  ISegmentationProvider     → Segment(frame_url, box) → MaskUrl
  IInpaintingProvider       → Inpaint(frame_url, mask_url, prompt) → InpaintedFrameUrl
  ```
