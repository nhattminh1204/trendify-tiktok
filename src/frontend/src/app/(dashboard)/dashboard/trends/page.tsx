"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { TrendingUp, ChevronDown, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { trendsApi, TrendDto } from "@/lib/api/trends";
import { cn } from "@/lib/utils";

const NICHES = ["All", "Fitness", "Cooking", "Tech", "Beauty", "Finance"];
const SORT_OPTIONS = ["Score", "Velocity", "Engagement", "Newest"];
const STATUS_OPTIONS = ["All", "Rising", "Peaked", "Declining"];

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium text-gray-400 w-16 flex-shrink-0">{label}</span>
      <ProgressBar value={value} className="flex-1" />
      <span className="text-xs font-semibold text-gray-600 w-7 text-right">
        {value.toFixed(0)}
      </span>
    </div>
  );
}

export default function TrendsPage() {
  const [niche, setNiche] = useState("All");
  const [sortOpen, setSortOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sort, setSort] = useState("Score");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["trends", niche],
    queryFn: () => trendsApi.list(niche === "All" ? undefined : niche.toLowerCase()),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-[22px] h-[22px] text-brand-500" strokeWidth={1.75} />
          <h1 className="text-2xl font-bold text-gray-900">Trend Intelligence</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Real-time TikTok trends scored by velocity, volume, and engagement.
        </p>
      </div>

      {/* Niche pills */}
      <div className="flex gap-2 flex-wrap overflow-x-auto pb-1 scrollbar-hide">
        {NICHES.map((n) => (
          <button
            key={n}
            onClick={() => setNiche(n)}
            className={cn(
              "flex-shrink-0 h-8 px-3.5 rounded-full text-[13px] font-medium transition-colors duration-150 border",
              niche === n
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white border-gray-200 text-gray-600 hover:border-brand-400"
            )}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Secondary toolbar */}
      <div className="flex items-center gap-3">
        {/* Sort */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setSortOpen((v) => !v); setStatusOpen(false); }}
          >
            Sort: {sort}
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 w-36 bg-white border border-gray-200 rounded-xl shadow-elevated py-1">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setSort(o); setSortOpen(false); }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setStatusOpen((v) => !v); setSortOpen(false); }}
          >
            Status: {statusFilter}
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          {statusOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 w-36 bg-white border border-gray-200 rounded-xl shadow-elevated py-1">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setStatusFilter(o); setStatusOpen(false); }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <span className="flex-1" />
        <span className="text-[13px] text-gray-400">{data?.length ?? 0} trends</span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-[15px] font-medium text-gray-500">No trends found for this niche yet.</p>
          <p className="text-sm text-gray-400 mt-1">Try a different niche or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((t: TrendDto) => (
            <Link key={t.id} href={`/dashboard/trends/${t.id}`}>
              <Card variant="interactive" padding="md" className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                      #{t.keyword.replace(/\s+/g, "")}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.niche} · {t.platform}</p>
                  </div>
                  <Badge variant={t.status}>{t.status}</Badge>
                </div>
                <div className="flex flex-col gap-1.5">
                  <ScoreBar label="Score"      value={t.score} />
                  <ScoreBar label="Velocity"   value={t.velocityScore} />
                  <ScoreBar label="Engagement" value={t.engagementScore} />
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-50">
                  <span className="text-xs text-brand-600 hover:underline">View details →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
