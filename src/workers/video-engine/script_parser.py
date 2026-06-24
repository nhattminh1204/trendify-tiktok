from __future__ import annotations

import re
from typing import Optional


def auto_parse(text: str, default_duration: int = 10) -> tuple[list[dict], str]:
    text = text.strip()
    if not text:
        return [], "unknown"

    parsed, fmt = _try_scene_format(text, default_duration)
    if parsed:
        return parsed, fmt

    parsed, fmt = _try_script_format(text, default_duration)
    if parsed:
        return parsed, fmt

    return _fallback_single_scene(text, default_duration), "plain"


def _try_scene_format(text: str, default_duration: int) -> tuple[Optional[list[dict]], str]:
    scenes = []
    blocks = re.split(r"\n\s*-{3,}\s*\n", text)
    if len(blocks) < 2:
        return None, ""

    for i, block in enumerate(blocks, 1):
        block = block.strip()
        if not block:
            continue
        lines = block.split("\n")
        voice_text = ""
        visual_desc = ""
        duration = default_duration
        for line in lines:
            line = line.strip()
            lower = line.lower()
            if lower.startswith("voice:") or lower.startswith("thoại:") or lower.startswith("lời:"):
                voice_text = line.split(":", 1)[1].strip()
            elif lower.startswith("visual:") or lower.startswith("hình:") or lower.startswith("cảnh:"):
                visual_desc = line.split(":", 1)[1].strip()
            elif lower.startswith("duration:") or lower.startswith("thời gian:") or lower.startswith("tg:"):
                try:
                    duration = int(re.search(r"\d+", line.split(":", 1)[1]).group())
                except (ValueError, AttributeError):
                    pass
        scenes.append({
            "id": i,
            "voice_text": voice_text,
            "description": visual_desc or voice_text[:100],
            "video_prompt": visual_desc or voice_text,
            "duration": duration,
        })

    if scenes:
        return scenes, "scene"
    return None, ""


def _try_script_format(text: str, default_duration: int) -> tuple[Optional[list[dict]], str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(paragraphs) < 2:
        return None, ""

    scenes = []
    for i, para in enumerate(paragraphs, 1):
        lines = [l.strip() for l in para.split("\n") if l.strip()]
        voice_text = " ".join(lines)
        scenes.append({
            "id": i,
            "voice_text": voice_text,
            "description": voice_text[:100],
            "video_prompt": voice_text,
            "duration": default_duration,
        })

    return scenes, "script"


def _fallback_single_scene(text: str, default_duration: int) -> list[dict]:
    return [{
        "id": 1,
        "voice_text": text,
        "description": text[:100],
        "video_prompt": text,
        "duration": default_duration,
    }]


def build_srt(scenes: list[dict]) -> str:
    lines = []
    cursor = 0.0

    for i, scene in enumerate(scenes, 1):
        voice_text = scene.get("voice_text") or scene.get("description", "")
        duration = scene.get("duration", 10)

        if not voice_text:
            cursor += duration
            continue

        start = cursor
        end = cursor + duration
        cursor = end

        def _fmt(sec: float) -> str:
            h = int(sec // 3600)
            m = int((sec % 3600) // 60)
            s = sec % 60
            return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

        lines.append(f"{i}\n{_fmt(start)} --> {_fmt(end)}\n{voice_text}\n")

    return "\n".join(lines)
