# ADR: Open-Source AI Stack for Video Generation

Date: 2026-06-22
Status: Accepted

---

## Context

The Character Replacement Engine and Product Replacement Engine require multiple AI capabilities not provided by the existing text-AI stack (OpenAI/Anthropic/Gemini):

| Capability | Required By |
|---|---|
| Pose estimation from video | Character Replacement |
| Identity-consistent video generation | Character Replacement |
| Text-guided object detection | Product Replacement |
| Video object segmentation | Product Replacement |
| Image inpainting | Product Replacement |
| Video compositing | Both |

Two deployment approaches are available: **cloud APIs** (no GPU needed) or **self-hosted open-source models** (GPU server required).

---

## Decision

**Phase 1:** Cloud API stack only. No GPU infrastructure required.
**Phase 2:** Migrate to a self-hosted stack using **ComfyUI** as the workflow orchestration layer.

Rationale:
1. Phase 1 must run on a single $20/month VPS (CPU-only)
2. Cloud APIs allow shipping without GPU investment
3. Self-hosted becomes cost-effective at approximately 500 renders/month
4. All providers are hidden behind interfaces — switching is a config change, not a code change

---

## Phase 1: Cloud API Stack

### Tools and Repos

| Capability | Tool | Source | Runs Where |
|---|---|---|---|
| Pose estimation | MediaPipe Pose | `google-ai-edge/mediapipe` | Local CPU (Python sidecar) |
| Character replacement | Kling AI API | `https://api.klingai.com` | Cloud |
| Character replacement (fallback) | Runway ML API | `https://api.dev.runwayml.com` | Cloud |
| Object detection | GroundingDINO via Replicate | `IDEA-Research/GroundingDINO` | Cloud |
| Video segmentation | SAM2 via Replicate | `facebookresearch/sam2` | Cloud |
| Background inpainting | Stability AI SDXL Inpaint | `https://api.stability.ai` | Cloud |
| Compositing | FFmpeg + OpenCV | — | Local CPU |
| Audio / BPM analysis | aubio | `aubio/aubio` | Local CPU (Python sidecar) |

### New Environment Variables Required

```
KLING_API_KEY=
KLING_API_BASE_URL=https://api.klingai.com

RUNWAY_API_KEY=
RUNWAY_API_BASE_URL=https://api.dev.runwayml.com

REPLICATE_API_TOKEN=

STABILITY_API_KEY=
STABILITY_API_BASE_URL=https://api.stability.ai
```

Add all to `.env.example`. Load via `IConfiguration` — never hardcode.

### Python Sidecar Service

MediaPipe Pose and aubio run in a dedicated Python container (`ai-worker` in Docker Compose).
This container exposes a minimal REST API on the internal Docker network:

```
POST /pose-extract   — extract pose keypoints from video
POST /face-detect    — detect faces in images (for model upload validation)
POST /bpm-detect     — detect BPM from audio file
```

Not exposed on external ports.

---

## Phase 2: Self-Hosted Stack

### Tools and Repos

| Capability | Tool | Repo | GPU Requirement |
|---|---|---|---|
| Workflow orchestration | ComfyUI | `comfyanonymous/ComfyUI` | Required for inference |
| Video generation (character replacement) | Wan2.1 | `Wan-AI/Wan2.1` | 24GB VRAM minimum |
| Identity consistency | IP-Adapter FaceID | `tencent-ailab/IP-Adapter` | Used with Wan2.1 |
| Pose-conditioned generation | ControlNet + AnimateDiff | `guoyww/animatediff` | 16GB VRAM minimum |
| Object detection | GroundingDINO | `IDEA-Research/GroundingDINO` | CPU-capable |
| Video segmentation | SAM2 | `facebookresearch/sam2` | 8GB VRAM minimum |
| Background inpainting | FLUX.1 Inpaint | `black-forest-labs/FLUX.1` | 16GB VRAM minimum |
| Compositing | FFmpeg + OpenCV | — | CPU |

### GPU Requirement

- Minimum: NVIDIA RTX 3090 (24 GB VRAM)
- Recommended: NVIDIA A100 (40 GB VRAM) for production throughput

### Deployment

Phase 2 introduces a separate `ai-gpu-worker` Docker Compose service alongside the main `api` service.
The GPU worker exposes the same REST interface as the Phase 1 cloud APIs — the main application code does not change.

---

## Cost Comparison (Per Video Render)

### Phase 1 Cloud APIs

| Step | Provider | Estimated Cost |
|---|---|---|
| Character replacement | Kling AI | $0.50–$1.00 |
| Object detection (50 frames × 4fps × 30s) | Replicate GroundingDINO | $0.03 |
| Segmentation (detected frames) | Replicate SAM2 | $0.02 |
| Background inpainting | Stability AI | $0.02 |
| Pose extraction, compositing | Local (CPU) | $0.00 |
| **Total per video** | | **~$0.57–$1.07** |

### Phase 2 Self-Hosted (amortized)

| GPU | Rental Rate | Renders/hr | Cost/video |
|---|---|---|---|
| RTX 3090 (cloud rental) | $0.80/hr | 15–20 | $0.04–$0.05 |
| A100 (cloud rental) | $3.00/hr | 60–80 | $0.04–$0.05 |

Break-even: approximately 500 renders/month justifies Phase 2 migration.

---

## Interface Contracts

All providers are abstracted in `src/shared/AI/`:

```csharp
ICharacterReplacementProvider
    GenerateAsync(sourceVideoUrl, referenceImageUrls, poseDataUrl, durationSeconds, ct)
    → CharacterReplacementResult { OutputVideoUrl, DurationSeconds }

IObjectDetectionProvider
    DetectAsync(frameUrl, textPrompt, ct)
    → DetectionResult { BoundingBoxes[], Scores[], Labels[] }

ISegmentationProvider
    SegmentAsync(frameUrl, boundingBox, ct)
    → SegmentationResult { MaskUrl }

IInpaintingProvider
    InpaintAsync(frameUrl, maskUrl, prompt, ct)
    → InpaintingResult { OutputFrameUrl }
```

Implementations in `src/infrastructure/AI/`:
- Phase 1: `KlingCharacterReplacementProvider`, `ReplicateObjectDetectionProvider`, `ReplicateSam2SegmentationProvider`, `StabilityInpaintingProvider`
- Phase 2: `ComfyUICharacterReplacementProvider`, `GroundingDinoLocalProvider`, `Sam2LocalProvider`, `FluxInpaintingProvider`

---

## Consequences

- Python sidecar container (`ai-worker`) is a new Docker Compose service — required from Phase 1
- `ai-worker` dependencies: `mediapipe`, `aubio`, `Pillow`, `opencv-python-headless`, `flask`
- `ai-worker` image pinned to a specific version in `Dockerfile.ai-worker` — no floating tags
- All new cloud API costs are tracked via the existing `AIUsageLog` entity
- `feature_context` values for new capabilities: `'character-replacement'`, `'product-replacement.detection'`, `'product-replacement.segmentation'`, `'product-replacement.inpainting'`
- Phase 2 GPU worker is an optional Docker Compose profile (`--profile gpu`) — system remains functional on CPU-only with cloud APIs
