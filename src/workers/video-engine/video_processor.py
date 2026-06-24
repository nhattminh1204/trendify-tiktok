from __future__ import annotations

import logging
import random
from pathlib import Path
from typing import Optional

logger = logging.getLogger("VideoEngine.Processor")


class VideoProcessor:
    def __init__(self, resolution: tuple[int, int] = (1080, 1920), fps: int = 30):
        self.resolution = resolution
        self.fps = fps

    def assemble(
        self,
        clip_paths: list[Path],
        output_path: Path,
        music_path: Optional[Path] = None,
        music_volume: float = 0.15,
        fade_duration: float = 0.5,
        voice_paths: Optional[dict[int, Path]] = None,
        subtitle_srt: Optional[str] = None,
    ) -> Optional[Path]:
        if not clip_paths:
            logger.error("No clips to assemble")
            return None

        try:
            from moviepy import (
                VideoFileClip, ImageClip, AudioFileClip,
                concatenate_videoclips, CompositeAudioClip,
                TextClip, CompositeVideoClip,
                vfx, afx,
            )
        except ImportError:
            logger.error("MoviePy not installed")
            return None

        video_exts = {".mp4", ".mov", ".webm", ".mkv"}
        image_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

        video_files = [p for p in clip_paths if p.suffix.lower() in video_exts]
        image_files = [p for p in clip_paths if p.suffix.lower() in image_exts]

        if video_files:
            return self._assemble_videos(
                clip_paths, output_path, music_path, music_volume,
                fade_duration, voice_paths, subtitle_srt,
            )
        if image_files:
            return self._assemble_images(image_files, output_path, music_path, music_volume)

        logger.error("No recognizable clip formats")
        return None

    def _assemble_videos(
        self,
        clip_paths: list[Path],
        output_path: Path,
        music_path: Optional[Path],
        music_volume: float,
        fade_duration: float,
        voice_paths: Optional[dict[int, Path]],
        subtitle_srt: Optional[str],
    ) -> Optional[Path]:
        try:
            from moviepy import (
                VideoFileClip, ImageClip, AudioFileClip,
                concatenate_videoclips, CompositeAudioClip,
                TextClip, CompositeVideoClip,
                vfx, afx,
            )
        except ImportError:
            return None

        target_size = None
        clips = []
        image_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
        video_exts = {".mp4", ".mov", ".avi", ".webm", ".mkv"}

        for idx, p in enumerate(clip_paths, 1):
            try:
                suffix = p.suffix.lower()
                if suffix in image_exts:
                    clip = ImageClip(str(p), duration=10.0)
                elif suffix in video_exts:
                    clip = VideoFileClip(str(p))
                else:
                    logger.warning("Skipping %s: unsupported format", p.name)
                    continue

                if target_size is None:
                    target_size = clip.size
                w, h = clip.size
                if (w, h) != target_size:
                    clip = clip.resized(target_size)

                if voice_paths and idx in voice_paths:
                    voice_p = voice_paths[idx]
                    if voice_p.exists():
                        try:
                            voice_clip = AudioFileClip(str(voice_p))
                            if voice_clip.duration > clip.duration:
                                voice_clip = voice_clip.subclipped(0, clip.duration)
                            if clip.audio:
                                clip = clip.with_audio(
                                    CompositeAudioClip([clip.audio, voice_clip])
                                )
                            else:
                                clip = clip.with_audio(voice_clip)
                            logger.info("Mixed voice scene %d: %s", idx, voice_p.name)
                        except Exception as e:
                            logger.warning("Failed to mix voice scene %d: %s", idx, e)

                clip = clip.with_effects([
                    vfx.FadeIn(fade_duration),
                    vfx.FadeOut(fade_duration),
                ])
                clips.append(clip)
                logger.info("Loaded %s (%.1fs)", p.name, clip.duration)
            except Exception as e:
                logger.warning("Skipping %s: %s", p.name, e)

        if not clips:
            logger.error("No clips could be loaded")
            return None

        total_duration = sum(c.duration for c in clips)
        if total_duration > 60:
            logger.warning("Total duration %.1fs > 60s, will be truncated", total_duration)

        final = concatenate_videoclips(clips, method="compose")

        if music_path and music_path.exists():
            try:
                bg = AudioFileClip(str(music_path)).with_multiply_volume(music_volume)
                if bg.duration < final.duration:
                    bg = bg.with_effects([afx.AudioLoop(duration=final.duration)])
                else:
                    bg = bg.subclipped(0, final.duration)
                if final.audio:
                    final = final.with_audio(CompositeAudioClip([final.audio, bg]))
                else:
                    final = final.with_audio(bg)
                logger.info("Added background music: %s", music_path.name)
            except Exception as e:
                logger.warning("Failed to add music: %s", e)

        if subtitle_srt:
            try:
                final = self._burn_subtitles(final, subtitle_srt)
            except Exception as e:
                logger.warning("Subtitle burn failed: %s", e)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        logger.info("Rendering final video: %s", output_path.name)

        try:
            final.write_videofile(
                str(output_path),
                fps=self.fps,
                codec="libx264",
                audio_codec="aac",
                threads=4,
                logger=None,
            )
        except Exception as e:
            logger.error("Render failed: %s", e)
            return None
        finally:
            for c in clips:
                try:
                    c.close()
                except Exception:
                    pass
            try:
                final.close()
            except Exception:
                pass

        if output_path.exists():
            size_mb = output_path.stat().st_size / 1024 / 1024
            logger.info("Video rendered: %s (%.1f MB)", output_path.name, size_mb)
            return output_path
        return None

    def _assemble_images(
        self,
        image_paths: list[Path],
        output_path: Path,
        music_path: Optional[Path],
        music_volume: float,
        duration_per_image: float = 10.0,
    ) -> Optional[Path]:
        try:
            from moviepy import ImageClip, concatenate_videoclips, AudioFileClip, CompositeAudioClip
            from moviepy import vfx, afx
        except ImportError:
            return None

        clips = []
        for p in image_paths:
            try:
                clip = (
                    ImageClip(str(p), duration=duration_per_image)
                    .resized(self.resolution)
                    .with_effects([vfx.FadeIn(0.5), vfx.FadeOut(0.5)])
                )
                clips.append(clip)
            except Exception:
                continue

        if not clips:
            return None

        final = concatenate_videoclips(clips, method="compose")

        if music_path and music_path.exists():
            try:
                bg = AudioFileClip(str(music_path)).with_multiply_volume(music_volume)
                if bg.duration < final.duration:
                    bg = bg.with_effects([afx.AudioLoop(duration=final.duration)])
                else:
                    bg = bg.subclipped(0, final.duration)
                final = final.with_audio(bg)
            except Exception:
                pass

        output_path.parent.mkdir(parents=True, exist_ok=True)
        final.write_videofile(
            str(output_path), fps=24, codec="libx264",
            audio_codec="aac" if final.audio else None, logger=None,
        )
        return output_path

    def _burn_subtitles(self, video, srt_text: str):
        try:
            from moviepy import TextClip, CompositeVideoClip
        except ImportError:
            return video

        entries = _parse_srt(srt_text)
        text_clips = []

        for start, end, text in entries:
            tc = (
                TextClip(
                    text=text,
                    font_size=40,
                    color="white",
                    stroke_color="black",
                    stroke_width=2,
                    method="caption",
                    size=(video.w - 80, None),
                )
                .with_start(start)
                .with_end(end)
                .with_position(("center", "bottom"))
            )
            text_clips.append(tc)

        if text_clips:
            return CompositeVideoClip([video, *text_clips])
        return video


def _ts_to_sec(ts: str) -> float:
    ts = ts.strip().replace(",", ".")
    h, m, rest = ts.split(":")
    return int(h) * 3600 + int(m) * 60 + float(rest)


def _parse_srt(srt: str) -> list[tuple[float, float, str]]:
    entries = []
    blocks = srt.strip().split("\n\n")
    for block in blocks:
        lines = [l.strip() for l in block.strip().splitlines() if l.strip()]
        if len(lines) < 3:
            continue
        try:
            start_s, end_s = lines[1].split(" --> ")
            text = " ".join(lines[2:])
            entries.append((_ts_to_sec(start_s), _ts_to_sec(end_s), text))
        except Exception:
            continue
    return entries
