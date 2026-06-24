from __future__ import annotations

import asyncio
import json
import logging
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger("VideoEngine.TTS")


class ITTSEngine:
    name: str = "base"

    async def synthesize(self, text: str, output_path: Path) -> Optional[Path]:
        raise NotImplementedError

    async def synthesize_batch(
        self, scenes: list[dict], voice_dir: Path
    ) -> dict[int, Path]:
        result: dict[int, Path] = {}
        voice_dir.mkdir(parents=True, exist_ok=True)

        for scene in scenes:
            sid = scene.get("id")
            text = scene.get("voice_text") or scene.get("description", "")
            if not text:
                continue
            out = voice_dir / f"voice_{sid:03d}.mp3"
            path = await self.synthesize(text, out)
            if path:
                result[sid] = path

        logger.info("TTS batch done: %d/%d scenes", len(result), len(scenes))
        return result


class EdgeTTSEngine(ITTSEngine):
    name = "edge"

    def __init__(self, voice: str = "vi-VN-HoaiMyNeural"):
        self.voice = voice

    async def synthesize(self, text: str, output_path: Path) -> Optional[Path]:
        try:
            import edge_tts
            communicate = edge_tts.Communicate(text, self.voice)
            await communicate.save(str(output_path))
            if output_path.exists() and output_path.stat().st_size > 100:
                return output_path
            return None
        except Exception as e:
            logger.warning("EdgeTTS error: %s", e)
            return None


class OmniVoiceTTS(ITTSEngine):
    name = "omnivoice"

    def __init__(self, voice_id: str = "ban_mai", voices_dir: Optional[Path] = None):
        self.voice_id = voice_id
        self.voices_dir = voices_dir or (Path(__file__).resolve().parent / "voices")

    async def synthesize(self, text: str, output_path: Path) -> Optional[Path]:
        try:
            voice_path = self.voices_dir / self.voice_id
            if not voice_path.exists():
                logger.warning("OmniVoice profile not found: %s", voice_path)
                return None

            import subprocess
            import sys

            cmd = [
                sys.executable, "-m", "omnivoice",
                "--voice", str(voice_path / "voice.pt"),
                "--profile", str(voice_path / "profile.json"),
                "--text", text,
                "--output", str(output_path),
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if result.returncode != 0:
                logger.warning("OmniVoice error: %s", result.stderr)
                return None

            if output_path.exists() and output_path.stat().st_size > 100:
                return output_path
            return None
        except Exception as e:
            logger.warning("OmniVoice error: %s", e)
            return None


class OpenAITTS(ITTSEngine):
    name = "openai"

    def __init__(self, api_key: str, voice: str = "alloy"):
        self.api_key = api_key
        self.voice = voice

    async def synthesize(self, text: str, output_path: Path) -> Optional[Path]:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/audio/speech",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "tts-1",
                        "input": text,
                        "voice": self.voice,
                    },
                )
                if resp.status_code != 200:
                    logger.warning("OpenAI TTS error: %d %s", resp.status_code, resp.text)
                    return None

                output_path.write_bytes(resp.content)
                if output_path.exists() and output_path.stat().st_size > 100:
                    return output_path
                return None
        except Exception as e:
            logger.warning("OpenAI TTS error: %s", e)
            return None


def get_tts_engine(
    engine: str = "edge",
    voice_id: str = "vi-VN-HoaiMyNeural",
    voices_dir: Optional[Path] = None,
    api_key: str = "",
) -> ITTSEngine:
    if engine == "omnivoice":
        return OmniVoiceTTS(voice_id=voice_id, voices_dir=voices_dir)
    elif engine == "openai":
        return OpenAITTS(api_key=api_key, voice=voice_id)
    return EdgeTTSEngine(voice=voice_id)
