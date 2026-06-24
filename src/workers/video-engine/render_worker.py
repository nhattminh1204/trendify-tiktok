from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
import tempfile
import time
from pathlib import Path
from typing import Optional

import config
from script_parser import auto_parse, build_srt
from tts_engine import get_tts_engine
from video_processor import VideoProcessor

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s",
)
logger = logging.getLogger("VideoEngine.Worker")


def _download_from_minio(url: str, dest: Path) -> Optional[Path]:
    try:
        import boto3
        from botocore.config import Config as Botocfg

        s3 = boto3.client(
            "s3",
            endpoint_url=f"http://{config.MINIO_ENDPOINT}" if not config.MINIO_USE_SSL
                          else f"https://{config.MINIO_ENDPOINT}",
            aws_access_key_id=config.MINIO_ACCESS_KEY,
            aws_secret_access_key=config.MINIO_SECRET_KEY,
            config=Botocfg(signature_version="s3v4"),
            use_ssl=config.MINIO_USE_SSL,
        )

        key = url.replace(f"minio://{config.MINIO_BUCKET}/", "")
        if key == url:
            key = url
        dest.parent.mkdir(parents=True, exist_ok=True)
        s3.download_file(config.MINIO_BUCKET, key, str(dest))
        return dest if dest.exists() else None
    except Exception as e:
        logger.warning("MinIO download failed for %s: %s", url, e)
        return None


def _upload_to_minio(local_path: Path, key: str) -> Optional[str]:
    try:
        import boto3
        from botocore.config import Config as Botocfg

        s3 = boto3.client(
            "s3",
            endpoint_url=f"http://{config.MINIO_ENDPOINT}" if not config.MINIO_USE_SSL
                          else f"https://{config.MINIO_ENDPOINT}",
            aws_access_key_id=config.MINIO_ACCESS_KEY,
            aws_secret_access_key=config.MINIO_SECRET_KEY,
            config=Botocfg(signature_version="s3v4"),
            use_ssl=config.MINIO_USE_SSL,
        )

        with open(local_path, "rb") as f:
            s3.upload_fileobj(f, config.MINIO_BUCKET, key)
        return f"minio://{config.MINIO_BUCKET}/{key}"
    except Exception as e:
        logger.error("MinIO upload failed for %s: %s", key, e)
        return None


def _pick_random_music(music_dir: Optional[Path] = None) -> Optional[Path]:
    if music_dir is None:
        music_dir = Path.cwd() / "assets" / "music"
    if not music_dir.exists():
        return None
    files = (
        list(music_dir.glob("*.mp3"))
        + list(music_dir.glob("*.m4a"))
        + list(music_dir.glob("*.wav"))
    )
    if not files:
        return None
    import random
    return random.choice(files)


async def run_render(job_config: dict) -> dict:
    job_id = job_config.get("job_id", "unknown")
    script_text = job_config.get("script_text", "")
    voice_id = job_config.get("voice_id", "vi-VN-HoaiMyNeural")
    tts_engine_name = job_config.get("tts_engine", config.TTS_ENGINE)
    template_id = job_config.get("template_id", "product-review-v1")
    scene_duration = job_config.get("scene_duration", 10)
    music_path_str = job_config.get("music_path", "")
    output_prefix = job_config.get("output_prefix", f"videos/{job_id}")
    assets = job_config.get("assets", [])

    logger.info("=" * 60)
    logger.info("Render job %s started", job_id)
    logger.info("TTS engine: %s, voice: %s", tts_engine_name, voice_id)
    logger.info("Template: %s, duration: %d s/scene", template_id, scene_duration)
    logger.info("Assets: %d", len(assets))
    logger.info("=" * 60)

    with tempfile.TemporaryDirectory(prefix=f"trendify_{job_id}_") as work_dir:
        work_path = Path(work_dir)
        clip_dir = work_path / "clips"
        clip_dir.mkdir(parents=True, exist_ok=True)

        product_images_dir = work_path / "product_images"
        product_images_dir.mkdir(exist_ok=True)

        music_path = None
        if music_path_str:
            music_path = Path(music_path_str)
            if not music_path.exists():
                music_path = _download_from_minio(music_path_str, work_path / "bgm")
        else:
            music_path = _pick_random_music()

        product_images = []
        for asset in assets:
            url = asset.get("url", "")
            if not url:
                continue
            if url.startswith("minio://"):
                dest = product_images_dir / f"product_{len(product_images)}.jpg"
                dl = _download_from_minio(url, dest)
                if dl:
                    product_images.append(dl)
            else:
                p = Path(url)
                if p.exists():
                    product_images.append(p)

        scenes, fmt = auto_parse(script_text, default_duration=scene_duration)
        if not scenes:
            logger.error("Script parsing failed: no scenes detected")
            return {"status": "failed", "error": "Script parsing failed"}

        logger.info("Parsed %d scenes (format: %s)", len(scenes), fmt)
        for s in scenes:
            preview = (s.get("video_prompt") or s.get("description", ""))[:60]
            logger.info("  Scene %02d: %s", s["id"], preview)

        tts = get_tts_engine(
            engine=tts_engine_name,
            voice_id=voice_id,
            voices_dir=config.VOICES_DIR,
            api_key=config.OPENAI_API_KEY,
        )
        voice_paths = {}
        if any(s.get("voice_text") or s.get("description") for s in scenes):
            logger.info("Generating TTS audio for %d scenes...", len(scenes))
            voice_dir = work_path / "voices"
            voice_paths = await tts.synthesize_batch(scenes, voice_dir)

        clip_paths = []
        for i, scene in enumerate(scenes, 1):
            sid = scene["id"]
            scene_desc = scene.get("video_prompt") or scene.get("description", "")
            clip_out = clip_dir / f"clip_{i:03d}.mp4"

            product_image = product_images[i - 1] if i - 1 < len(product_images) else (
                product_images[0] if product_images else None
            )

            if product_image and product_image.exists():
                clip_paths.append(product_image)
                logger.info("  Scene %02d: using product image %s", sid, product_image.name)
            else:
                blank = work_path / f"blank_{i:03d}.txt"
                blank.write_text(scene_desc)
                clip_paths.append(blank)

        srt_content = build_srt(scenes) if voice_paths else None

        output_filename = f"{output_prefix.replace('/', '_')}.mp4"
        final_output = work_path / output_filename

        logger.info("Assembling final video...")
        processor = VideoProcessor(
            resolution=config.VIDEO_RESOLUTION,
            fps=config.VIDEO_FPS,
        )

        started = time.time()
        result = processor.assemble(
            clip_paths=clip_paths,
            output_path=final_output,
            music_path=music_path,
            voice_paths=voice_paths,
            subtitle_srt=srt_content,
        )
        elapsed = time.time() - started

        if not result or not result.exists():
            logger.error("Video assembly failed")
            return {"status": "failed", "error": "Video assembly failed"}

        duration_seconds = 0
        try:
            from moviepy import VideoFileClip
            with VideoFileClip(str(result)) as clip:
                duration_seconds = int(clip.duration)
        except Exception:
            pass

        minio_key = f"{output_prefix}/{output_filename}"
        uploaded_url = _upload_to_minio(result, minio_key)

        if not uploaded_url:
            logger.error("MinIO upload failed")
            return {"status": "failed", "error": "MinIO upload failed"}

        file_size_bytes = result.stat().st_size

        logger.info("=" * 60)
        logger.info("Render complete: %s", uploaded_url)
        logger.info("Duration: %ds, Size: %.1f MB, Time: %.1fs",
                     duration_seconds, file_size_bytes / 1024 / 1024, elapsed)
        logger.info("=" * 60)

        return {
            "status": "success",
            "output_url": uploaded_url,
            "duration_seconds": duration_seconds,
            "file_size_bytes": file_size_bytes,
            "render_duration_seconds": elapsed,
        }


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Trendify Video Engine Worker")
    parser.add_argument("--job-id", required=True, help="Render job ID")
    parser.add_argument("--config", required=True, help="JSON string of job configuration")
    args = parser.parse_args()

    try:
        job_config = json.loads(args.config)
        job_config["job_id"] = args.job_id
    except json.JSONDecodeError as e:
        result = {"status": "failed", "error": f"Invalid config JSON: {e}"}
        print(json.dumps(result))
        sys.exit(1)

    result = asyncio.run(run_render(job_config))

    print(json.dumps(result))
    if result.get("status") != "success":
        sys.exit(1)


if __name__ == "__main__":
    main()
