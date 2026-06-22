"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  Mic,
  Music,
  Play,
  Volume2,
  CheckCircle2,
  X,
} from "lucide-react";
import { ContentPipelineStepper } from "@/components/content/pipeline-stepper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const VOICES = [
  { value: "female-energetic", label: "Nữ · Năng động" },
  { value: "female-calm",      label: "Nữ · Nhẹ nhàng" },
  { value: "male-confident",   label: "Nam · Tự tin" },
  { value: "male-friendly",    label: "Nam · Thân thiện" },
];

const SPEEDS = ["0.9×", "1×", "1.1×", "1.2×"] as const;

const TRACKS = [
  { id: "1", name: "Upbeat Pop",       duration: "2:34", genre: "Pop" },
  { id: "2", name: "Chill Lofi",       duration: "3:12", genre: "Lofi" },
  { id: "3", name: "Motivational EDM", duration: "2:48", genre: "EDM" },
  { id: "4", name: "Corporate Clean",  duration: "1:58", genre: "Corporate" },
  { id: "5", name: "Hip Hop Beat",     duration: "2:20", genre: "Hip Hop" },
];

type VoiceState = "idle" | "generating" | "ready";

export default function MediaPage() {
  const params = useParams();
  const id = params?.id as string;

  // video
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [isDragging, setIsDragging]       = useState(false);

  // voiceover
  const [voice, setVoice]           = useState("female-energetic");
  const [speed, setSpeed]           = useState<string>("1×");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");

  // music
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [volume, setVolume]               = useState(40);

  const handleGenerateVoiceover = () => {
    setVoiceState("generating");
    setTimeout(() => setVoiceState("ready"), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-[13px] flex items-center gap-1.5">
        <Link href="/dashboard/content" className="text-gray-400 hover:text-gray-700 transition-colors">Content</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/dashboard/content/${id}`} className="text-gray-400 hover:text-gray-700 transition-colors">5 fitness myths debunked</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Media</span>
      </nav>

      {/* Pipeline stepper */}
      <div className="flex justify-center py-2">
        <ContentPipelineStepper id={id} currentStep={2} />
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-[24px] font-bold text-gray-900">Media & Voiceover</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload video, tạo lồng tiếng AI, và thêm nhạc nền cho nội dung của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT — Video + Music */}
        <div className="flex flex-col gap-4">
          {/* Video upload */}
          <Card padding="lg">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Video</h2>

            {videoUploaded ? (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ aspectRatio: "9/16", width: 180 }}
                >
                  <div className="text-gray-400 text-center px-4">
                    <Play className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">fitness_video.mp4</p>
                    <p className="text-xs opacity-50 mt-0.5">0:47</p>
                  </div>
                  <button
                    onClick={() => setVideoUploaded(false)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[12px] text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Video uploaded · 0:47
                </p>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e)   => { e.preventDefault(); setIsDragging(false); setVideoUploaded(true); }}
                onClick={() => setVideoUploaded(true)}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
                  isDragging
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Kéo thả video vào đây</p>
                <p className="text-[13px] text-gray-400 mt-1">hoặc click để chọn file</p>
                <p className="text-[11px] text-gray-300 mt-3">
                  MP4, MOV, AVI · Tối đa 500MB · 9:16 khuyến nghị
                </p>
              </div>
            )}
          </Card>

          {/* Background music */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-4 h-4 text-brand-600" />
              <h2 className="text-[15px] font-semibold text-gray-900">Nhạc nền</h2>
              <span className="text-[11px] text-gray-400 ml-1">tuỳ chọn</span>
            </div>

            <div className="flex flex-col gap-2">
              {TRACKS.map((track) => {
                const isSelected = selectedTrack === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(isSelected ? null : track.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      isSelected
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{track.name}</p>
                      <p className="text-[11px] text-gray-400">{track.genre} · {track.duration}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                  </div>
                );
              })}
            </div>

            {selectedTrack && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-[13px] text-gray-600 w-20 shrink-0">Âm lượng {volume}%</span>
                  <input
                    type="range" min={0} max={100} value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-1.5 accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT — AI Voiceover */}
        <div className="flex flex-col gap-4">
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-4 h-4 text-violet-600" />
              <h2 className="text-[15px] font-semibold text-gray-900">Lồng tiếng AI</h2>
            </div>

            {/* Script preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Script từ Bước 1
              </p>
              <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-4">
                You&apos;ve been doing this wrong your entire life… Most people think
                cardio is everything when it comes to getting fit. Here are 5 fitness
                myths that most creators get wrong...
              </p>
              <Link
                href={`/dashboard/content/${id}`}
                className="text-[11px] text-brand-600 hover:underline mt-1.5 inline-block"
              >
                Chỉnh sửa script →
              </Link>
            </div>

            <Select
              label="Giọng đọc"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            >
              {VOICES.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </Select>

            <div className="mt-3">
              <label className="text-[13px] font-medium text-gray-700 block mb-1.5">
                Tốc độ đọc
              </label>
              <div className="flex gap-2">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={cn(
                      "flex-1 h-8 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer",
                      speed === s
                        ? "bg-brand-50 border-brand-500 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="ai"
              fullWidth
              className="mt-4"
              loading={voiceState === "generating"}
              onClick={handleGenerateVoiceover}
            >
              {voiceState === "generating" ? "Đang tạo lồng tiếng…" : (
                <><Mic className="w-4 h-4" /> Tạo lồng tiếng AI</>
              )}
            </Button>

            {voiceState === "ready" && (
              <div className="mt-4 bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-[12px] font-semibold text-violet-800 flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lồng tiếng hoàn tất · 0:47
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white hover:bg-violet-700 shrink-0">
                    <Play className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                  <div className="flex-1 h-1.5 bg-violet-200 rounded-full">
                    <div className="h-1.5 w-1/3 bg-violet-600 rounded-full" />
                  </div>
                  <span className="text-[11px] text-violet-600 shrink-0">0:15 / 0:47</span>
                </div>
              </div>
            )}

            {voiceState === "idle" && (
              <p className="text-[11px] text-gray-400 mt-2.5 text-center">
                Script từ Bước 1 sẽ được dùng · ~0:47 phút
              </p>
            )}
          </Card>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-[13px] font-semibold text-amber-800 mb-2">💡 Tips sản xuất</p>
            <ul className="flex flex-col gap-1.5">
              {[
                "Quay dọc 9:16 để tối ưu TikTok",
                "Ánh sáng tốt quan trọng hơn camera đắt tiền",
                "1.5 giây đầu quyết định người xem có tiếp tục không",
                "Dùng teleprompter để đọc script tự nhiên hơn",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="text-[12px] text-amber-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
        <Link href={`/dashboard/content/${id}`}>
          <Button variant="secondary">← Quay lại Script</Button>
        </Link>
        <Link href={`/dashboard/content/${id}/caption`}>
          <Button variant="primary">Tiếp theo: Caption →</Button>
        </Link>
      </div>
    </div>
  );
}
