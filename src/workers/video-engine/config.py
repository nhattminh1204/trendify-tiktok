from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent

TTS_ENGINE = os.getenv("TTS_ENGINE", "edge")
TTS_VOICE = os.getenv("TTS_VOICE", "vi-VN-HoaiMyNeural")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "trendify-assets")
MINIO_USE_SSL = os.getenv("MINIO_USE_SSL", "false").lower() == "true"

VIDEO_RESOLUTION = (1080, 1920)
VIDEO_FPS = 30
MAX_DURATION_SECONDS = 60
MIN_DURATION_SECONDS = 10
RENDER_TIMEOUT_SECONDS = 300

VOICES_DIR = BASE_DIR / "voices"


def load_job_config() -> dict:
    raw = os.getenv("RENDER_JOB_CONFIG", "")
    if not raw:
        return {}
    return json.loads(raw)


def load_voice_profile(voice_id: str) -> Optional[dict]:
    profile_path = VOICES_DIR / voice_id / "profile.json"
    if not profile_path.exists():
        return None
    with open(profile_path) as f:
        return json.load(f)
