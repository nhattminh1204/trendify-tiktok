"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, Lightbulb, Users, Zap, AlertTriangle, SearchX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface TrendDto {
  id: string;
  keyword: string;
  niche: string;
  platform: string;
  score: number;
  status: "rising" | "peaked" | "declining" | "expired";
}

interface BudgetDto {
  spentUsd: number;
  limitUsd: number;
  remainingUsd: number;
  isWarning: boolean;
}

const QUICK_STATS = [
  { icon: TrendingUp, label: "Trends Tracked", value: "1,240",   color: "text-brand-600", bg: "bg-brand-50" },
  { icon: Lightbulb,  label: "Active Ideas",   value: "8",       color: "text-brand-600", bg: "bg-brand-50" },
  { icon: Users,      label: "Followers",      value: "124.5K",  color: "text-brand-600", bg: "bg-brand-50" },
  { icon: Zap,        label: "AI Budget Used", value: "25%",     color: "text-brand-600", bg: "bg-brand-50" },
];

export default function DashboardPage() {
  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["trends"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TrendDto[] }>("/api/v1/trends/");
      return res.data.data;
    },
  });

  const { data: budget } = useQuery({
    queryKey: ["ai-budget"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: BudgetDto }>("/api/v1/ai/budget");
      return res.data.data;
    },
  });

  const spent = budget?.spentUsd ?? 12.5;
  const limit = budget?.limitUsd ?? 50;
  const pct = Math.min(100, (spent / limit) * 100);
  const isWarning = budget?.isWarning ?? pct >= 80;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your TikTok creator intelligence hub</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_STATS.map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} padding="md">
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", bg)}>
                <Icon className={cn("w-4 h-4", color)} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Budget widget */}
      <Card variant={isWarning ? "warning" : "default"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isWarning && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            <span className={cn("text-sm font-medium", isWarning ? "text-amber-700" : "text-gray-700")}>
              AI Budget this month
            </span>
          </div>
          <span className={cn("text-sm font-semibold", isWarning ? "text-amber-700" : "text-gray-900")}>
            ${spent.toFixed(2)} / ${limit.toFixed(2)}
          </span>
        </div>
        <ProgressBar value={pct} size="md" className="mt-2.5" />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">{pct.toFixed(1)}% used</span>
          <span className="text-xs text-gray-400">${(limit - spent).toFixed(2)} remaining</span>
        </div>
      </Card>

      {/* Trending Now */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
          <Link href="/dashboard/trends" className="text-sm text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        <p className="text-xs text-gray-400 mb-4">Live trend data · updated every 15 min</p>

        {trendsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : !trends || trends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SearchX className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No trends found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map((t) => (
              <Link key={t.id} href={`/dashboard/trends/${t.id}`}>
                <Card variant="interactive" padding="md">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                      #{t.keyword.replace(/\s+/g, "")}
                    </p>
                    <Badge variant={t.status as "rising" | "peaked" | "declining" | "expired"}>
                      {t.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{t.niche} · {t.platform}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <ProgressBar value={t.score} className="flex-1" />
                    <span className="text-xs font-semibold text-gray-600 w-7 text-right">
                      {t.score.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-xs text-brand-600 hover:underline mt-2">View details →</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
