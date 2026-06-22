# Feature: AI Model Library

## Purpose

A library of AI-generated characters (models) used as the human subject in video content.
Each model is defined by visual attributes — face, body type, gender, age, and style.
Users select from system-provided models or upload their own custom models for brand identity.

---

## Model Sources

| Source | Description |
|---|---|
| System models | Pre-built, curated models available to all workspaces |
| User-uploaded models | Custom models trained on user-provided reference images |

---

## Entities

### AIModel

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | NULL = system model (shared across all workspaces) |
| name | VARCHAR(200) | Internal identifier |
| display_name | VARCHAR(200) | User-facing name |
| gender | VARCHAR(20) | 'female', 'male', 'neutral' |
| age_range | VARCHAR(20) | 'teen', 'twenties', 'thirties', 'forties_plus' |
| body_type | VARCHAR(50) | 'slim', 'athletic', 'curvy', 'plus_size' |
| style | VARCHAR(100) | 'casual', 'luxury', 'sporty', 'streetwear', 'elegant' |
| source | VARCHAR(50) | 'system', 'user_upload' |
| status | VARCHAR(50) | 'active', 'processing', 'failed', 'archived' |
| thumbnail_url | TEXT | MinIO — representative still image (512×512 JPG) |
| reference_image_urls | TEXT[] | MinIO — 3–20 reference images for identity consistency |
| model_config | JSONB | Provider-specific config (e.g., API model ID, checkpoint path). Never contains secrets. |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### AIModelUploadRequest

Tracks the processing pipeline for user-uploaded models.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| model_id | UUID | FK → ai_models. Populated after processing completes. |
| upload_status | VARCHAR(50) | 'pending', 'processing', 'complete', 'failed' |
| display_name | VARCHAR(200) | From user input |
| gender | VARCHAR(20) | |
| age_range | VARCHAR(20) | |
| body_type | VARCHAR(50) | |
| style | VARCHAR(100) | |
| reference_image_count | SMALLINT | |
| reference_image_urls | TEXT[] | MinIO — raw uploads |
| error_message | TEXT | |
| created_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

---

## Visual Attribute Taxonomy

### Gender
- `female`
- `male`
- `neutral`

### Age Range
- `teen` — 15–19
- `twenties` — 20–29
- `thirties` — 30–39
- `forties_plus` — 40+

### Body Type
- `slim`
- `athletic`
- `curvy`
- `plus_size`

### Style
- `casual` — everyday, accessible
- `luxury` — high-fashion, aspirational
- `sporty` — athletic, activewear
- `streetwear` — urban, youth
- `elegant` — formal, evening

---

## Business Rules

1. System models (`tenant_id IS NULL`) are read-only — workspace users cannot modify or delete them
2. User-uploaded models belong exclusively to a single workspace — no cross-workspace sharing
3. A model with `status = 'processing'` or `'failed'` cannot be selected in a render job
4. Reference image requirements: minimum 3, maximum 20 images; each must be JPG or PNG; minimum resolution 512×512; maximum file size 10 MB per image
5. `model_config` contains only provider-specific non-sensitive data — never API keys or credentials
6. Tier limits on user-uploaded models: Free = 2, Pro = 10, Agency = unlimited
7. System model minimum at launch: 6 models covering diverse combinations of gender, age range, and style
8. A model with active render jobs (status `queued` or `processing`) cannot be deleted — return `MODEL_IN_USE`
9. Archiving a model preserves its MinIO assets — only hides it from the selection UI
10. Thumbnail is always a square crop at 512×512 resolution — generated automatically during upload processing

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `AIModelReadyEvent` | Upload processing completes, status → active | — (notify user) |
| `AIModelProcessingFailedEvent` | Upload processing fails after validation | — (notify user) |

---

## Background Jobs

### ModelProcessingJob
- Trigger: `AIModelUploadRequest` created
- Process:
  1. Validate reference images: count (≥3), format (JPG/PNG), minimum resolution (512×512)
  2. Run face detection on each image (MediaPipe FaceDetection, CPU-only) — reject if fewer than 80% of images have a detectable face
  3. Select the best reference image (highest face detection confidence score) as thumbnail
  4. Crop and resize thumbnail to 512×512 JPG — store in MinIO
  5. Build `model_config` for the configured generation provider
  6. Create `AIModel` record with `status = 'active'`
  7. Update `AIModelUploadRequest.upload_status = 'complete'`
  8. Publish `AIModelReadyEvent`

---

## API Endpoints

```
GET  /api/v1/ai-models
     ?source=system|user_upload|all  (default: all)
     ?gender=female|male|neutral
     ?style=casual|luxury|sporty|streetwear|elegant
     ?status=active  (default: active only)
     ?page={n}&page_size={20}
     → PagedResult<AIModelSummaryDto>

GET  /api/v1/ai-models/{id}
     → ApiResponse<AIModelDetailDto>

POST /api/v1/ai-models/upload
     Content-Type: multipart/form-data
     Fields:
       display_name: string
       gender: female|male|neutral
       age_range: teen|twenties|thirties|forties_plus
       body_type: slim|athletic|curvy|plus_size
       style: casual|luxury|sporty|streetwear|elegant
       images[]: file[] (3–20 files)
     → ApiResponse<AIModelUploadRequestDto>

GET  /api/v1/ai-models/upload/{request_id}
     → ApiResponse<AIModelUploadRequestDto>  (poll for processing status)

DELETE /api/v1/ai-models/{id}
       → ApiResponse  (soft delete → archived)
```

---

## DTOs

### AIModelSummaryDto
```json
{
  "id", "display_name", "gender", "age_range", "body_type",
  "style", "source", "status", "thumbnail_url"
}
```

### AIModelDetailDto
```json
{
  "id", "display_name", "gender", "age_range", "body_type",
  "style", "source", "status",
  "thumbnail_url", "reference_image_count",
  "created_at"
}
```

### AIModelUploadRequestDto
```json
{
  "id", "upload_status", "reference_image_count",
  "model_id", "error_message",
  "created_at", "completed_at"
}
```

---

## Acceptance Criteria

### AC-1: Browse System Models
- [ ] User sees at least 6 system models in the model library
- [ ] Each card shows: thumbnail, display name, gender, style, age range badge
- [ ] User can filter by gender, style, and age range
- [ ] Filter combinations work correctly (AND logic between active filters)

### AC-2: Upload Custom Model
- [ ] User uploads 3–20 reference images via file picker
- [ ] Upload is rejected with clear error if fewer than 3 images are selected
- [ ] Upload is rejected with clear error if any image has no detectable face
- [ ] Processing status is visible with a progress indicator (UI polls every 5 seconds)
- [ ] User receives in-app notification when model is ready

### AC-3: Model Selection in Video Generation
- [ ] Model picker appears in the video generation flow when a template with `has_human_subject = true` is selected
- [ ] Only `status = 'active'` models are shown in the picker
- [ ] Selected model thumbnail is displayed on the render job detail page
- [ ] Switching model before generating is allowed

### AC-4: Tier Limits
- [ ] Free tier user attempting to upload a 3rd custom model sees a clear upgrade prompt
- [ ] Attempting to delete a model with active render jobs returns a clear `MODEL_IN_USE` error message

---

## Implementation Notes

- Phase 1: System models only. User upload processing (`ModelProcessingJob`) is deferred to Phase 2.
- Phase 1: `model_config` stores either a pre-built cloud API model ID (Kling AI) or a reference to a pre-loaded IP-Adapter checkpoint
- Face detection uses `mediapipe` Python package in a sidecar Docker container — expose as REST endpoint `POST /face-detect` returning confidence scores per image
- Sidecar container communicates only on the internal Docker network — not exposed externally
- Thumbnail generation: `ffmpeg -i input_image -vf "crop=min(iw\,ih):min(iw\,ih),scale=512:512" -frames:v 1 output.jpg`
- `IModelProcessingProvider` interface in `src/shared/` — allows swapping processing provider without changing business logic
