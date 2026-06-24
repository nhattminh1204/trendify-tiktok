# ADR: Video Engine Hybrid Architecture — .NET Orchestration + Python Sidecar

Date: 2026-06-24
Status: Accepted

---

## Context

The existing Video Engine spec (Phase 1) defines a `text_to_video` pipeline:
```
Script + Product Images → TTS → FFmpeg composition → .mp4
```

Two external resources informed a better approach:

1. **OmniVoice VI** (HuggingFace) — 6 Vietnamese TTS voices ready to use, Apache-2.0, based on `k2-fsa/OmniVoice`
2. **tools_create_video_grok** (GitHub) — Complete Python video generation pipeline with TTS factory, MoviePy assembly, SRT subtitle burn-in, and multi-engine abstraction

The current spec relies on raw FFmpeg calls from .NET for video assembly. This is suboptimal because:
- Python ecosystem has vastly better video processing libraries (MoviePy, OpenCV, Pillow)
- TTS for Vietnamese requires Python ecosystem (edge-tts, OmniVoice)
- Character Replacement & Product Replacement (Phase 2) require Python (MediaPipe, SAM2, GroundingDINO)
- Raw FFmpeg compositing from .NET is error-prone and hard to maintain

---

## Decision

Adopt a **hybrid architecture**: .NET handles orchestration, job management, API, and persistence; Python sidecar handles all media processing.

```
┌─────────────────────────────────────────────────────────┐
│  .NET Backend (orchestration layer)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ API Endpoints │  │ Hangfire     │  │ Domain Events│  │
│  │ (Carter)      │  │ Workers      │  │ (MediatR)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│  ┌──────┴─────────────────┴─────────────────┴───────┐  │
│  │ PythonSidecarService (Process.Start)              │  │
│  │ Calls: python render_worker.py --job-id {id}     │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        │                                │
├────────────────────────┼────────────────────────────────┤
│  Python Sidecar        │                                │
│  ┌─────────────────────┴─────────────────────────────┐  │
│  │  render_worker.py                                  │  │
│  │     ├── TTS Engine (OmniVoice / edge-tts / OpenAI) │  │
│  │     ├── VideoProcessor (MoviePy 2.x)                │  │
│  │     ├── ScriptParser (scene extraction + SRT)       │  │
│  │     └── FFmpeg (final encode + burn subtitles)      │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Communication Protocol

.NET passes job parameters to Python via command-line JSON:
```bash
python render_worker.py \
  --job-id "uuid" \
  --config "{\"script_text\":\"...\",\"voice_id\":\"ban_mai\",...}"
```

Python sidecar:
1. Reads job params from stdin/args
2. Downloads assets from MinIO (presigned URLs passed in config)
3. Processes video
4. Uploads result to MinIO
5. Writes result JSON to stdout: `{"status":"success","output_url":"minio://...","duration_seconds":45}`
6. Exits with code 0 (success) or non-zero (failure)

.NET worker reads stdout, parses result, updates job status.

---

## TTS Provider Architecture

Adopt the same factory pattern as `IAIProvider` from the AI Engine module:

```
ITTSEngine
├── OmniVoiceTTS      (local, 6 Vietnamese voices)
├── EdgeTTS           (free, vi-VN-HoaiMyNeural)
├── OpenAITTS         (tts-1, tts-1-hd) — Phase 2
└── ElevenLabsTTS     (custom voice) — Phase 2
```

Voice IDs map:

| Provider | Voice IDs |
|---|---|
| OmniVoice | `ban_mai`, `lan_trinh`, `ngan_ha`, `ngoc_huyen`, `thao_trinh`, `tuong_vy` |
| EdgeTTS | `vi-VN-HoaiMyNeural`, `vi-VN-NamMinhNeural` |
| OpenAI | `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer` |

---

## Pipeline: Phase 1 (This Implementation)

```
ContentReadyEvent (from Content Brain)
    ↓
VideoRenderJob created (status: queued)
    ↓
Hangfire picks up → PythonSidecarService.CallAsync()
    ↓
Python render_worker.py:
    1. Parse script into scenes
    2. Generate TTS audio per scene
    3. Fetch product images from MinIO
    4. Build scene plan from template
    5. Assemble video with MoviePy
    6. Burn subtitles (SRT)
    7. Add background music
    8. Encode final .mp4 (1080×1920, H.264 + AAC)
    9. Upload to MinIO
    ↓
.NET reads result → status = rendered
    ↓
VideoRenderedEvent published
```

---

## Directory Structure

```
src/
  workers/
    video-engine/
      requirements.txt
      config.py
      render_worker.py          ← Entry point
      tts_engine.py             ← OmniVoice + edge-tts + OpenAI
      video_processor.py        ← MoviePy assembly
      script_parser.py          ← Scene parsing + SRT
      voices/                   ← OmniVoice VI profiles (git LFS or download)
```

---

## Consequences

1. Python 3.10+ required on worker hosts (add to Dockerfile)
2. FFmpeg still required (for final encoding step)
3. MoviePy 2.x replaces raw FFmpeg calls in .NET
4. Vietnamese TTS works out of the box via OmniVoice VI
5. Phase 2 (Character/Product Replacement) naturally extends via Python sidecar
6. No changes to existing modules — domain events remain in .NET
7. Slightly higher operational complexity (two runtimes) but vastly simpler code
8. `VideoRenderWorker` is simpler: orchestrate via Python, not raw FFmpeg from C#
