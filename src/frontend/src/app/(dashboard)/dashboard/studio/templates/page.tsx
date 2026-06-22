"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, PlayCircle, Bot, SlidersHorizontal, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

const PRODUCT_TYPES = [
  { value: "all",            label: "Tất cả" },
  { value: "fashion_female", label: "Thời trang nữ" },
  { value: "fashion_male",   label: "Thời trang nam" },
  { value: "watch",          label: "Đồng hồ" },
  { value: "handbag",        label: "Túi xách" },
  { value: "cosmetics",      label: "Mỹ phẩm" },
  { value: "jewelry",        label: "Trang sức" },
  { value: "footwear",       label: "Giày dép" },
];

const MOCK_TEMPLATES = [
  {
    id: "t1", name: "Mirror Selfie Outfit Reveal", video_style: "mirror_selfie",
    compatible_product_types: ["fashion_female", "fashion_male"],
    has_human_subject: true, estimated_duration_seconds: 28,
    description: "Nhân vật tự quay trước gương, showcase outfit từ đầu đến chân. Hook mở đầu là spin vào frame.",
    energy_level: "high",
  },
  {
    id: "t2", name: "Catwalk Street Style", video_style: "catwalk",
    compatible_product_types: ["fashion_female", "footwear"],
    has_human_subject: true, estimated_duration_seconds: 22,
    description: "Catwalk trên phố, góc quay tracking, cắt cảnh nhanh theo nhịp nhạc.",
    energy_level: "high",
  },
  {
    id: "t3", name: "Luxury Wrist Close-Up", video_style: "luxury_cinematic",
    compatible_product_types: ["watch", "jewelry"],
    has_human_subject: false, estimated_duration_seconds: 18,
    description: "Cận cảnh sản phẩm trên cổ tay / cổ, slow motion, ánh sáng cinematic.",
    energy_level: "low",
  },
  {
    id: "t4", name: "Before / After Makeup", video_style: "before_after",
    compatible_product_types: ["cosmetics"],
    has_human_subject: true, estimated_duration_seconds: 35,
    description: "Split screen hoặc transition before → after. Nhân vật nhìn thẳng vào camera.",
    energy_level: "medium",
  },
  {
    id: "t5", name: "Bag Drop Lifestyle", video_style: "lifestyle_carry",
    compatible_product_types: ["handbag", "footwear"],
    has_human_subject: false, estimated_duration_seconds: 20,
    description: "Túi được đặt / thả xuống bề mặt đẹp, góc overhead và medium, ánh sáng tự nhiên.",
    energy_level: "low",
  },
  {
    id: "t6", name: "Transition Outfit Change", video_style: "transition_outfit",
    compatible_product_types: ["fashion_female", "fashion_male"],
    has_human_subject: true, estimated_duration_seconds: 30,
    description: "Transition outfit nhanh, đổi trang phục giữa chừng. Hook là tay che camera rồi bỏ ra.",
    energy_level: "high",
  },
  {
    id: "t7", name: "Makeup Routine GRWM", video_style: "makeup_routine",
    compatible_product_types: ["cosmetics"],
    has_human_subject: true, estimated_duration_seconds: 45,
    description: "Get Ready With Me dạng nhanh, từng bước makeup, cận tay khi apply sản phẩm.",
    energy_level: "medium",
  },
  {
    id: "t8", name: "Slow Motion Product Drop", video_style: "slow_motion_reveal",
    compatible_product_types: ["watch", "jewelry", "handbag"],
    has_human_subject: false, estimated_duration_seconds: 15,
    description: "Sản phẩm rơi hoặc được đặt xuống theo slow motion, nền trắng hoặc marble.",
    energy_level: "low",
  },
  {
    id: "t9", name: "Viral Dance Product Reveal", video_style: "viral_dance",
    compatible_product_types: ["fashion_female", "fashion_male"],
    has_human_subject: true, estimated_duration_seconds: 25,
    description: "Nhân vật nhảy theo trend TikTok, reveal sản phẩm vào điểm drop của nhạc.",
    energy_level: "high",
  },
];

const energyBadge: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: "bg-red-50",    text: "text-red-600",   label: "High energy" },
  medium: { bg: "bg-amber-50",  text: "text-amber-600", label: "Medium" },
  low:    { bg: "bg-blue-50",   text: "text-blue-600",  label: "Cinematic" },
};

export default function TemplatesPage() {
  const [productFilter, setProductFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = MOCK_TEMPLATES.filter(t =>
    productFilter === "all" || t.compatible_product_types.includes(productFilter)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="w-5 h-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-gray-900">Viral Templates</h1>
          </div>
          <p className="text-sm text-gray-500">Thư viện cấu trúc video viral. Chọn template phù hợp với sản phẩm.</p>
        </div>
        <Link
          href="/dashboard/studio/generate"
          className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          <Clapperboard className="w-4 h-4" />
          Tạo video ngay
        </Link>
      </div>

      {/* Product type filter */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {PRODUCT_TYPES.map(pt => (
          <button
            key={pt.value}
            onClick={() => setProductFilter(pt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              productFilter === pt.value
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            {pt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} templates</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Film className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Chưa có template phù hợp</p>
          <p className="text-xs text-gray-400 mt-1">Thư viện đang được bổ sung thêm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(t => {
            const energy = energyBadge[t.energy_level];
            const isHovered = hoveredId === t.id;
            return (
              <div
                key={t.id}
                onMouseEnter={() => setHoveredId(t.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-brand-400 hover:shadow-sm transition-all"
              >
                {/* Thumbnail area */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                  <Film className="w-10 h-10 text-gray-200" />
                  {isHovered && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white/90" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {!t.has_human_subject && (
                      <span className="text-[10px] font-semibold bg-gray-800/70 text-white px-2 py-0.5 rounded-full">
                        No model
                      </span>
                    )}
                    <span className="text-[10px] font-semibold bg-gray-800/70 text-white px-2 py-0.5 rounded-full">
                      {t.estimated_duration_seconds}s
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug">{t.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{t.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] font-medium text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                      {t.video_style}
                    </span>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", energy.bg, energy.text)}>
                      {energy.label}
                    </span>
                    {t.has_human_subject && (
                      <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Bot className="w-2.5 h-2.5" /> Model required
                      </span>
                    )}
                  </div>

                  {/* Compatible types */}
                  <div className="flex flex-wrap gap-1">
                    {t.compatible_product_types.map(pt => (
                      <span key={pt} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">
                        {pt}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/dashboard/studio/generate?template_id=${t.id}`}
                    className="mt-4 flex items-center justify-center gap-1.5 w-full h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Clapperboard className="w-3 h-3" />
                    Dùng template này
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
