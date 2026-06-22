"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrendDetailDto {
  id: string;
  keyword: string;
  niche: string;
  platform: string;
  score: number;
  velocityScore: number;
  volumeScore: number;
  engagementScore: number;
  recencyScore?: number;
  status: "rising" | "peaked" | "declining" | "expired";
  detectedAt: string;
  expiresAt: string | null;
  estimatedReach?: number;
  engagementRate?: number;
  relatedHashtags?: string[];
  aiInsights?: string[];
  rawData?: Record<string, unknown> | null;
}

interface HistoryPoint {
  day: string;
  score: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_HISTORY: HistoryPoint[] = [
  { day: "Mon", score: 65 },
  { day: "Tue", score: 72 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 79 },
  { day: "Fri", score: 83 },
  { day: "Sat", score: 81 },
  { day: "Sun", score: 87 },
];

const MOCK_DETAIL: TrendDetailDto = {
  id: "mock-id",
  keyword: "fitnessmotivation",
  niche: "Fitness",
  platform: "TikTok",
  score: 87,
  velocityScore: 40,
  volumeScore: 25,
  engagementScore: 20,
  recencyScore: 15,
  status: "rising",
  detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: null,
  estimatedReach: 2_400_000,
  engagementRate: 6.4,
  relatedHashtags: [
    "workout",
    "gym",
    "fitness",
    "healthylifestyle",
    "motivation",
    "exercise",
    "bodybuilding",
    "fitlife",
    "crossfit",
    "cardio",
  ],
  aiInsights: [
    "This trend peaks between 6–9 PM on weekdays — schedule content accordingly for maximum reach.",
    "User-generated transformation videos are driving 73% of the engagement in this niche.",
    "Combining this hashtag with #gymtok increases average views by 2.3× based on recent data.",
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card padding="md">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1.5 text-[28px] font-bold leading-none text-gray-900">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[12px] text-gray-400">{sub}</p>
      )}
    </Card>
  );
}

function ScoreBreakdownBar({
  label,
  pts,
  max,
}: {
  label: string;
  pts: number;
  max: number;
}) {
  const pct = Math.min(100, (pts / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 flex-shrink-0 text-[13px] font-medium text-gray-600">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-2 rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[13px] font-semibold text-gray-700 w-10 text-right">
        {pts}pts
      </span>
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-elevated px-3 py-2">
      <p className="text-[12px] text-gray-500">{label}</p>
      <p className="text-[14px] font-semibold text-gray-900">
        Score: {payload[0].value}
      </p>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function TrendDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-40" />

      {/* Header */}
      <div className="flex justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-9 w-52" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Score breakdown */}
      <Skeleton className="h-44 rounded-xl" />

      {/* Chart */}
      <Skeleton className="h-56 rounded-xl" />

      {/* Bottom row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "60% 1fr" }}>
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrendDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data, isLoading } = useQuery<TrendDetailDto>({
    queryKey: ["trend-detail", id],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: TrendDetailDto }>(
          `/api/v1/trends/${id}`
        );
        return res.data.data;
      } catch {
        return MOCK_DETAIL;
      }
    },
    enabled: !!id,
  });

  if (isLoading) return <TrendDetailSkeleton />;

  const trend = data ?? MOCK_DETAIL;

  const daysAgo = Math.floor(
    (Date.now() - new Date(trend.detectedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const velocityDisplay = `+${trend.velocityScore.toFixed(0)}%/day`;
  const engagementDisplay =
    trend.engagementRate != null
      ? `${trend.engagementRate.toFixed(1)}%`
      : `${trend.engagementScore.toFixed(0)}%`;
  const reachDisplay =
    trend.estimatedReach != null
      ? trend.estimatedReach >= 1_000_000
        ? `${(trend.estimatedReach / 1_000_000).toFixed(1)}M`
        : `${(trend.estimatedReach / 1_000).toFixed(0)}K`
      : "—";

  const hasAiInsights =
    trend.aiInsights != null && trend.aiInsights.length > 0;

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/dashboard/trends"
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          Trends
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 font-medium">
          #{trend.keyword.replace(/\s+/g, "")}
        </span>
      </nav>

      {/* 2. Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
            #{trend.keyword.replace(/\s+/g, "")}
          </h1>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Badge variant="default">{trend.niche}</Badge>
            <Badge variant="info">{trend.platform}</Badge>
            <Badge variant={trend.status}>{trend.status}</Badge>
            <span className="text-[12px] text-gray-400">
              Detected {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
            </span>
          </div>
        </div>
        <Button variant="primary" size="md">
          <Lightbulb className="w-4 h-4" />
          Create content from this trend →
        </Button>
      </div>

      {/* 3. Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Trend Score"
          value={trend.score}
          sub="out of 100"
        />
        <StatCard
          label="Velocity"
          value={velocityDisplay}
          sub="score growth per day"
        />
        <StatCard
          label="Engagement Rate"
          value={engagementDisplay}
          sub="avg across posts"
        />
        <StatCard
          label="Est. Reach"
          value={reachDisplay}
          sub="potential impressions"
        />
      </div>

      {/* 4. Score Breakdown */}
      <Card padding="md">
        <h2 className="text-[16px] font-semibold text-gray-900 mb-4">
          Score Breakdown
        </h2>
        <div className="flex flex-col gap-3">
          <ScoreBreakdownBar
            label="Velocity"
            pts={trend.velocityScore ?? 40}
            max={100}
          />
          <ScoreBreakdownBar
            label="Volume"
            pts={trend.volumeScore ?? 25}
            max={100}
          />
          <ScoreBreakdownBar
            label="Engagement"
            pts={trend.engagementScore ?? 20}
            max={100}
          />
          <ScoreBreakdownBar
            label="Recency"
            pts={trend.recencyScore ?? 15}
            max={100}
          />
        </div>
      </Card>

      {/* 5. Trend Timeline Chart */}
      <Card padding="md">
        <h2 className="text-[16px] font-semibold text-gray-900 mb-4">
          Score History (7 days)
        </h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={MOCK_HISTORY}
            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              domain={[50, 100]}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#brandGrad)"
              dot={{ r: 3, fill: "#6366F1", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#6366F1", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* 6. Bottom row: Related Hashtags + AI Insights */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "60% 1fr" }}
      >
        {/* Related Hashtags */}
        <Card padding="md">
          <h2 className="text-[16px] font-semibold text-gray-900 mb-4">
            Related Hashtags
          </h2>
          <div className="flex flex-wrap gap-2">
            {(trend.relatedHashtags ?? MOCK_DETAIL.relatedHashtags ?? []).map(
              (tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors cursor-default"
                >
                  #{tag}
                </span>
              )
            )}
          </div>
        </Card>

        {/* AI Insights */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <h2 className="text-[15px] font-semibold text-violet-800">
              AI Insights
            </h2>
          </div>

          {hasAiInsights ? (
            <ul className="flex flex-col gap-2.5">
              {trend.aiInsights!.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  <span className="text-[13px] text-gray-700 leading-relaxed">
                    {insight}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-[13px] text-violet-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating insights…
            </div>
          )}

          <Button
            variant="ai"
            size="md"
            fullWidth
            className="mt-auto"
          >
            ✨ Generate content idea →
          </Button>
        </div>
      </div>
    </div>
  );
}
