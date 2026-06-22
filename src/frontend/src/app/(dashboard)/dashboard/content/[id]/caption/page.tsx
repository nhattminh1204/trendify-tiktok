"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Hash,
  Sparkles,
  MessageCircle,
  Repeat2,
  Scissors,
  Download,
} from "lucide-react";
import { ContentPipelineStepper } from "@/components/content/pipeline-stepper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const SUGGESTED_HASHTAGS = [
  "#fitness", "#fitnessmyths", "#workout", "#healthylifestyle",
  "#gymtips", "#fitnesstips", "#gymlife", "#fitnessjourney",
  "#workoutmotivation", "#fitfam",
];

const MAX_CAPTION = 2200;

export default function CaptionPage() {
  const params = useParams();
  const id = params?.id as string;

  const [caption, setCaption] = useState(
    "Bạn đang làm sai điều này cả đời rồi… Đây là 5 hiểu lầm về thể dục mà hầu hết mọi người đều tin — và lý do tại sao chúng đang cản trở tiến trình của bạn 👇"
  );
  const [hashtags, setHashtags] = useState([
    "#fitness", "#fitnessmyths", "#workout", "#healthylifestyle", "#gymtips",
  ]);
  const [hashInput, setHashInput] = useState("");

  // TikTok settings
  const [allowComments, setAllowComments]   = useState(true);
  const [allowDuet, setAllowDuet]           = useState(true);
  const [allowStitch, setAllowStitch]       = useState(true);
  const [allowDownload, setAllowDownload]   = useState(false);

  const remaining = MAX_CAPTION - caption.length;

  function addHashtag(raw: string) {
    const tag = raw.trim().replace(/^#*/, "#");
    if (tag === "#" || hashtags.includes(tag) || hashtags.length >= 30) return;
    setHashtags((prev) => [...prev, tag]);
    setHashInput("");
  }

  function removeHashtag(tag: string) {
    setHashtags((prev) => prev.filter((h) => h !== tag));
  }

  const tiktokToggles = [
    { icon: MessageCircle, label: "Cho phép bình luận",  value: allowComments,  onChange: setAllowComments },
    { icon: Repeat2,       label: "Cho phép Duet",        value: allowDuet,      onChange: setAllowDuet },
    { icon: Scissors,      label: "Cho phép Stitch",      value: allowStitch,    onChange: setAllowStitch },
    { icon: Download,      label: "Cho phép tải xuống",   value: allowDownload,  onChange: setAllowDownload },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-[13px] flex items-center gap-1.5">
        <Link href="/dashboard/content" className="text-gray-400 hover:text-gray-700 transition-colors">Content</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/dashboard/content/${id}`} className="text-gray-400 hover:text-gray-700 transition-colors">5 fitness myths debunked</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Caption</span>
      </nav>

      {/* Stepper */}
      <div className="flex justify-center py-2">
        <ContentPipelineStepper id={id} currentStep={3} />
      </div>

      <div>
        <h1 className="text-[24px] font-bold text-gray-900">Caption & Hashtags</h1>
        <p className="text-sm text-gray-500 mt-1">
          Viết caption cuối cùng, chọn hashtag, và cấu hình cài đặt TikTok.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* Caption */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-gray-900">Caption</h2>
              <button className="flex items-center gap-1.5 text-[12px] text-violet-600 hover:underline">
                <Sparkles className="w-3.5 h-3.5" /> AI gợi ý
              </button>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={MAX_CAPTION}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 resize-y focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-all"
              placeholder="Viết caption của bạn…"
            />
            <div className="flex justify-end mt-1">
              <span className={cn(
                "text-[11px]",
                remaining < 100 ? "text-amber-600" : "text-gray-400"
              )}>
                {remaining.toLocaleString()} ký tự còn lại
              </span>
            </div>
          </Card>

          {/* Hashtags */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-brand-600" />
              <h2 className="text-[15px] font-semibold text-gray-900">Hashtags</h2>
              <span className="ml-auto text-[11px] text-gray-400">{hashtags.length}/30</span>
            </div>

            {/* Selected tags */}
            <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-brand-50 border border-brand-200 rounded-full px-2.5 py-0.5 text-[12px] text-brand-700"
                >
                  {tag}
                  <button
                    onClick={() => removeHashtag(tag)}
                    className="hover:text-red-600 ml-0.5 leading-none text-[14px] font-light"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && hashInput.trim()) {
                    e.preventDefault();
                    addHashtag(hashInput);
                  }
                }}
                placeholder="Nhập hashtag + Enter"
                className="flex-1 h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-all"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { if (hashInput.trim()) addHashtag(hashInput); }}
              >
                Thêm
              </Button>
            </div>

            {/* Suggestions */}
            <div className="mt-3">
              <p className="text-[11px] text-gray-400 mb-2">Gợi ý</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_HASHTAGS
                  .filter((t) => !hashtags.includes(t))
                  .slice(0, 7)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addHashtag(tag)}
                      className="bg-gray-100 hover:bg-brand-50 border border-transparent hover:border-brand-200 rounded-full px-2.5 py-0.5 text-[12px] text-gray-600 hover:text-brand-600 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          {/* TikTok settings */}
          <Card padding="lg">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Cài đặt TikTok</h2>
            <div className="flex flex-col divide-y divide-gray-50">
              {tiktokToggles.map(({ icon: Icon, label, value, onChange }) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-[14px] text-gray-700">{label}</span>
                  </div>
                  <Toggle checked={value} onChange={onChange} />
                </div>
              ))}
            </div>
          </Card>

          {/* Cover thumbnail */}
          <Card padding="lg">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Ảnh bìa</h2>
            <div className="flex flex-col items-center gap-2">
              <div
                style={{ aspectRatio: "9/16", width: 90 }}
                className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="text-[11px] text-gray-400 text-center px-2">Auto</span>
              </div>
              <p className="text-[11px] text-gray-400">Tự động chọn từ video</p>
              <Button variant="secondary" size="sm" fullWidth>
                Chọn khung ảnh
              </Button>
            </div>
          </Card>

          {/* Caption preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Xem trước caption
            </p>
            <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-4">
              {caption || <span className="text-gray-300">Chưa có caption…</span>}
            </p>
            {hashtags.length > 0 && (
              <p className="text-[12px] text-brand-600 mt-2 line-clamp-2">
                {hashtags.join(" ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
        <Link href={`/dashboard/content/${id}/media`}>
          <Button variant="secondary">← Quay lại Media</Button>
        </Link>
        <Link href={`/dashboard/content/${id}/publish`}>
          <Button variant="primary">Tiếp theo: Đăng bài →</Button>
        </Link>
      </div>
    </div>
  );
}
