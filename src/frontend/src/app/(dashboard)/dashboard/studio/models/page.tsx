"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Plus, Upload, BadgeCheck, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_MODELS = [
  { id: "m1", display_name: "Luna", gender: "female", age_range: "twenties", body_type: "slim", style: "luxury", source: "system", status: "active" },
  { id: "m2", display_name: "Minh", gender: "male", age_range: "thirties", body_type: "athletic", style: "casual", source: "system", status: "active" },
  { id: "m3", display_name: "Ami", gender: "female", age_range: "twenties", body_type: "slim", style: "sporty", source: "system", status: "active" },
  { id: "m4", display_name: "Alex", gender: "neutral", age_range: "twenties", body_type: "slim", style: "streetwear", source: "system", status: "active" },
  { id: "m5", display_name: "Sophia", gender: "female", age_range: "thirties", body_type: "curvy", style: "elegant", source: "system", status: "active" },
  { id: "m6", display_name: "Nam", gender: "male", age_range: "twenties", body_type: "athletic", style: "sporty", source: "system", status: "active" },
  { id: "m7", display_name: "My Model", gender: "female", age_range: "twenties", body_type: "slim", style: "casual", source: "user_upload", status: "active" },
  { id: "m8", display_name: "Brand Model 2", gender: "female", age_range: "thirties", body_type: "athletic", style: "luxury", source: "user_upload", status: "processing" },
];

const GENDER_FILTERS = ["all", "female", "male", "neutral"] as const;
const STYLE_FILTERS = ["all", "casual", "luxury", "sporty", "streetwear", "elegant"] as const;

const styleColors: Record<string, string> = {
  casual:     "bg-gray-100 text-gray-600",
  luxury:     "bg-amber-50 text-amber-700",
  sporty:     "bg-blue-50 text-blue-700",
  streetwear: "bg-violet-50 text-violet-700",
  elegant:    "bg-pink-50 text-pink-700",
};

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  active:     { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  processing: { bg: "bg-amber-100", text: "text-amber-700", label: "Processing..." },
  failed:     { bg: "bg-red-100",   text: "text-red-700",   label: "Failed" },
};

export default function ModelsPage() {
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");

  const filtered = MOCK_MODELS.filter(m => {
    if (genderFilter !== "all" && m.gender !== genderFilter) return false;
    if (styleFilter !== "all" && m.style !== styleFilter) return false;
    return true;
  });

  const userModels = MOCK_MODELS.filter(m => m.source === "user_upload");

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-gray-900">AI Model Library</h1>
          </div>
          <p className="text-sm text-gray-500">Nhân vật AI dùng trong video. Chọn từ thư viện hoặc tải model của bạn.</p>
        </div>
        <Link
          href="/dashboard/studio/models/upload"
          className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Model
        </Link>
      </div>

      {/* Tier info */}
      <div className="mb-5 p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center gap-3">
        <Bot className="w-5 h-5 text-brand-600 flex-shrink-0" />
        <p className="text-sm text-brand-700">
          Custom models: <strong>{userModels.length} / 2</strong> (Free tier)
        </p>
        <Link href="/pricing" className="ml-auto text-xs font-semibold text-brand-600 hover:underline">
          Nâng cấp
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1.5">
          {GENDER_FILTERS.map(g => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                genderFilter === g ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              {g === "all" ? "Tất cả giới tính" : g}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {STYLE_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStyleFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                styleFilter === s ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              {s === "all" ? "Tất cả style" : s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} models</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Upload card */}
        <Link
          href="/dashboard/studio/models/upload"
          className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-all min-h-[180px] group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center mb-2 transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-brand-600 transition-colors" />
          </div>
          <p className="text-xs font-medium text-gray-500 group-hover:text-brand-600 text-center transition-colors">
            Upload Model Mới
          </p>
        </Link>

        {filtered.map(m => {
          const badge = statusBadge[m.status];
          return (
            <div
              key={m.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center hover:border-brand-400 hover:shadow-sm transition-all cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center mb-3">
                <Bot className="w-8 h-8 text-brand-400" />
              </div>

              {/* Name + badges */}
              <p className="text-sm font-semibold text-gray-900 mb-1">{m.display_name}</p>

              <div className="flex flex-wrap gap-1 justify-center mb-2">
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", styleColors[m.style])}>
                  {m.style}
                </span>
                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {m.gender}
                </span>
              </div>

              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", badge.bg, badge.text)}>
                {badge.label}
              </span>

              {m.source === "user_upload" && (
                <span className="mt-1.5 text-[9px] font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  Custom
                </span>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Bot className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Không có model nào khớp bộ lọc</p>
          <p className="text-xs text-gray-400 mt-1">Thử bỏ bộ lọc hoặc upload model của bạn</p>
        </div>
      )}
    </div>
  );
}
