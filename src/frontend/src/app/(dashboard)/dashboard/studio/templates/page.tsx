"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Film, PlayCircle, Bot, SlidersHorizontal, Clapperboard, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { videoApi, TemplateDto } from "@/lib/api/video";
import { Skeleton } from "@/components/ui/skeleton";

const PRODUCT_TYPES = [
  { value: "", label: "All" },
  { value: "fashion_female", label: "Fashion Women" },
  { value: "fashion_male", label: "Fashion Men" },
  { value: "watch", label: "Watches" },
  { value: "handbag", label: "Handbags" },
  { value: "cosmetics", label: "Cosmetics" },
  { value: "jewelry", label: "Jewelry" },
  { value: "footwear", label: "Footwear" },
];

const energyBadge: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: "bg-red-50",    text: "text-red-600",   label: "High energy" },
  medium: { bg: "bg-amber-50",  text: "text-amber-600", label: "Medium" },
  low:    { bg: "bg-blue-50",   text: "text-blue-600",  label: "Cinematic" },
};

export default function TemplatesPage() {
  const [productFilter, setProductFilter] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["video-templates", productFilter],
    queryFn: () => videoApi.listTemplates(productFilter || undefined),
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="w-5 h-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-gray-900">Video Templates</h1>
          </div>
          <p className="text-sm text-gray-500">Pre-built video structures optimized for viral content.</p>
        </div>
        <Link
          href="/dashboard/studio/generate"
          className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          <Clapperboard className="w-4 h-4" />
          Create video
        </Link>
      </div>

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
        <span className="ml-auto text-xs text-gray-400">{templates?.length ?? 0} templates</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
              <Skeleton className="w-full aspect-video rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <div className="text-center py-16">
          <SearchX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No templates found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different product type filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map(t => {
            const energy = t.energyLevel ? energyBadge[t.energyLevel] : null;
            const isHovered = hoveredId === t.id;
            return (
              <div
                key={t.id}
                onMouseEnter={() => setHoveredId(t.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-brand-400 hover:shadow-sm transition-all"
              >
                <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                  <Film className="w-10 h-10 text-gray-200" />
                  {isHovered && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white/90" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {!t.hasHumanSubject && (
                      <span className="text-[10px] font-semibold bg-gray-800/70 text-white px-2 py-0.5 rounded-full">
                        No model
                      </span>
                    )}
                    {t.estimatedDurationSeconds && (
                      <span className="text-[10px] font-semibold bg-gray-800/70 text-white px-2 py-0.5 rounded-full">
                        {t.estimatedDurationSeconds}s
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug">{t.name}</h3>
                  </div>
                  {t.description && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{t.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {t.videoStyle && (
                      <span className="text-[10px] font-medium text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                        {t.videoStyle}
                      </span>
                    )}
                    {energy && (
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", energy.bg, energy.text)}>
                        {energy.label}
                      </span>
                    )}
                    {t.hasHumanSubject && (
                      <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Bot className="w-2.5 h-2.5" /> Model required
                      </span>
                    )}
                  </div>

                  {t.compatibleProductTypes && (
                    <div className="flex flex-wrap gap-1">
                      {t.compatibleProductTypes.split(",").map(pt => (
                        <span key={pt} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">
                          {pt.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/dashboard/studio/generate?template_id=${t.id}`}
                    className="mt-4 flex items-center justify-center gap-1.5 w-full h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Clapperboard className="w-3 h-3" />
                    Use this template
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
