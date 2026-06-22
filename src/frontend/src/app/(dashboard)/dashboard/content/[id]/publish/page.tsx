"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Zap,
  CheckCircle2,
  TrendingUp,
  Play,
} from "lucide-react";
import { ContentPipelineStepper } from "@/components/content/pipeline-stepper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const BEST_TIMES = [
  { day: "Thu", time: "7:00 PM", score: 94, label: "Best"  },
  { day: "Fri", time: "8:00 PM", score: 88, label: "Great" },
  { day: "Tue", time: "6:30 PM", score: 81, label: "Good"  },
];

const ACCOUNTS = [
  { id: "1", username: "@myfitnesscreator", followers: "124.5K", initials: "MF" },
];

const SUMMARY_ROWS = [
  ["Tài khoản", "@myfitnesscreator"],
  ["Định dạng",  "Standard (30-60s)"],
  ["Lồng tiếng", "Nữ · Năng động"],
  ["Nhạc nền",   "Upbeat Pop"],
  ["Hashtags",   "5 tags"],
];

type PublishState = "idle" | "scheduling" | "scheduled" | "publishing" | "published";

export default function PublishPage() {
  const params = useParams();
  const id = params?.id as string;

  const [selectedAccount, setSelectedAccount] = useState("1");
  const [selectedSlot,    setSelectedSlot]    = useState<string | null>(null);
  const [customDate,      setCustomDate]      = useState("");
  const [customTime,      setCustomTime]      = useState("19:00");
  const [publishState,    setPublishState]    = useState<PublishState>("idle");

  const handleSchedule    = () => { setPublishState("scheduling");  setTimeout(() => setPublishState("scheduled"),  1500); };
  const handlePublishNow  = () => { setPublishState("publishing"); setTimeout(() => setPublishState("published"), 2000); };

  // ── Success screen ────────────────────────────────────────────────────────
  if (publishState === "scheduled" || publishState === "published") {
    const isScheduled = publishState === "scheduled";
    return (
      <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
        <div className="flex justify-center py-2">
          <ContentPipelineStepper id={id} currentStep={4} />
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-[28px] font-bold text-gray-900">
            {isScheduled ? "Đã lên lịch đăng!" : "Đã đăng lên TikTok!"}
          </h1>
          <p className="text-[15px] text-gray-500 mt-2 max-w-md">
            {isScheduled
              ? "Bài viết sẽ được tự động đăng vào thời gian bạn đã chọn."
              : "Nội dung của bạn đang live trên TikTok! Kiểm tra analytics sau vài giờ."}
          </p>

          <div className="flex gap-3 mt-8">
            <Link href="/dashboard/content">
              <Button variant="secondary">Về Content</Button>
            </Link>
            <Link href="/dashboard/content/calendar">
              <Button variant="secondary">
                <Calendar className="w-4 h-4" /> Xem Calendar
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="primary">Xem Analytics →</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main publish screen ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-[13px] flex items-center gap-1.5">
        <Link href="/dashboard/content" className="text-gray-400 hover:text-gray-700 transition-colors">Content</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/dashboard/content/${id}`} className="text-gray-400 hover:text-gray-700 transition-colors">5 fitness myths debunked</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Publish</span>
      </nav>

      {/* Stepper */}
      <div className="flex justify-center py-2">
        <ContentPipelineStepper id={id} currentStep={4} />
      </div>

      <div>
        <h1 className="text-[24px] font-bold text-gray-900">Lên lịch & Đăng bài</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chọn thời điểm tốt nhất để đăng bài và tiếp cận nhiều người xem nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* Account selector */}
          <Card padding="lg">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Đăng lên tài khoản</h2>
            {ACCOUNTS.map((acc) => {
              const active = selectedAccount === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    active ? "border-brand-500 bg-brand-50" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-[12px] font-semibold text-brand-700 shrink-0">
                    {acc.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{acc.username}</p>
                    <p className="text-[11px] text-gray-400">{acc.followers} followers</p>
                  </div>
                  {active && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                </div>
              );
            })}
          </Card>

          {/* Best times */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <h2 className="text-[15px] font-semibold text-gray-900">Thời gian vàng đăng bài</h2>
              <span className="text-[11px] text-gray-400 ml-1">dựa trên audience của bạn</span>
            </div>

            <div className="flex flex-col gap-2">
              {BEST_TIMES.map((slot) => {
                const key    = `${slot.day}-${slot.time}`;
                const active = selectedSlot === key;
                return (
                  <div
                    key={key}
                    onClick={() => { setSelectedSlot(active ? null : key); setCustomDate(""); }}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors",
                      active ? "border-brand-500 bg-brand-50" : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{slot.day} · {slot.time}</span>
                        <Badge variant={slot.label === "Best" ? "success" : slot.label === "Great" ? "brand" : "default"}>
                          {slot.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                          <div
                            className="h-1.5 bg-brand-500 rounded-full transition-all"
                            style={{ width: `${slot.score}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 w-16 text-right shrink-0">
                          {slot.score}% reach
                        </span>
                      </div>
                    </div>
                    {active && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Custom schedule */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-gray-500" />
              <h2 className="text-[15px] font-semibold text-gray-900">Tùy chọn thời gian</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Ngày</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => { setCustomDate(e.target.value); setSelectedSlot(null); }}
                  className="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Giờ</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          {/* TikTok preview */}
          <Card padding="lg">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Xem trước bài đăng</h2>
            <div
              className="bg-gray-900 rounded-xl overflow-hidden mx-auto relative"
              style={{ aspectRatio: "9/16", maxHeight: 340, width: "100%" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

              {/* Play icon in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
              </div>

              {/* Side actions */}
              <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 text-white">
                {["❤️", "💬", "↗️"].map((emoji, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base">
                      {emoji}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-4 left-4 right-14 z-10">
                <p className="text-white text-sm font-semibold">@myfitnesscreator</p>
                <p className="text-white/80 text-[12px] mt-1 line-clamp-2">
                  Bạn đang làm sai điều này cả đời rồi… #fitness #fitnessmyths
                </p>
                <p className="text-white/50 text-[11px] mt-1.5">🎵 Original sound</p>
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card padding="lg">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Tóm tắt bài đăng</h2>
            <ul className="flex flex-col gap-2">
              {SUMMARY_ROWS.map(([label, value]) => (
                <li key={label} className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">{label}</span>
                  <span className="text-[13px] font-medium text-gray-900">{value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100 mt-2">
        <Link href={`/dashboard/content/${id}/caption`}>
          <Button variant="secondary">← Quay lại Caption</Button>
        </Link>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            loading={publishState === "scheduling"}
            onClick={handleSchedule}
          >
            <Clock className="w-4 h-4" />
            {publishState === "scheduling" ? "Đang lên lịch…" : "Lên lịch"}
          </Button>
          <Button
            variant="primary"
            loading={publishState === "publishing"}
            onClick={handlePublishNow}
          >
            <Zap className="w-4 h-4" />
            {publishState === "publishing" ? "Đang đăng…" : "Đăng ngay"}
          </Button>
        </div>
      </div>
    </div>
  );
}
