"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "90d";

interface MetricsDto {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowersGained: number;
  avgEngagementRate: number;
  bestPostingDay: number | null;
  bestPostingHour: number | null;
}

interface PostRow {
  id: string;
  title: string;
  views: number;
  likes: number;
  engagementRate: number;
  postedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d",  label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`
);

const PLACEHOLDER_ACCOUNT_ID = "00000000-0000-0000-0000-000000000000";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_METRICS: MetricsDto = {
  totalViews: 1_245_800,
  totalLikes: 89_420,
  totalComments: 12_350,
  totalShares: 8_900,
  totalFollowersGained: 2_340,
  avgEngagementRate: 0.0482,
  bestPostingDay: 4, // Thursday
  bestPostingHour: 19, // 7pm
};

const MOCK_POSTS: PostRow[] = [
  {
    id: "1",
    title: "Morning workout routine that transformed my body",
    views: 284_500,
    likes: 21_300,
    engagementRate: 7.9,
    postedAt: "2026-06-15T07:30:00Z",
  },
  {
    id: "2",
    title: "5-minute meal prep for the whole week",
    views: 198_700,
    likes: 15_800,
    engagementRate: 6.4,
    postedAt: "2026-06-12T18:00:00Z",
  },
  {
    id: "3",
    title: "The trend nobody is talking about in fitness",
    views: 175_200,
    likes: 13_100,
    engagementRate: 5.8,
    postedAt: "2026-06-10T19:15:00Z",
  },
  {
    id: "4",
    title: "How I gained 10K followers in one week",
    views: 142_000,
    likes: 9_870,
    engagementRate: 5.1,
    postedAt: "2026-06-08T20:00:00Z",
  },
  {
    id: "5",
    title: "React to this for a surprise workout challenge",
    views: 118_300,
    likes: 7_650,
    engagementRate: 4.7,
    postedAt: "2026-06-05T16:45:00Z",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-card p-5",
        accent && "border-l-[3px] border-l-brand-500"
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1.5 text-[28px] font-bold leading-none text-gray-900">
        {value}
      </p>
      {sub && <p className="mt-1 text-[12px] text-gray-400">{sub}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-5 py-3">
        <div className="w-10 h-10 bg-gray-100 rounded-md animate-pulse" />
      </td>
      <td className="px-5 py-3">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
      </td>
      <td className="px-5 py-3">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
      </td>
      <td className="px-5 py-3">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-12" />
      </td>
      <td className="px-5 py-3">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-14" />
      </td>
      <td className="px-5 py-3">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
      </td>
    </tr>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data, isLoading, isError, isFetching } = useQuery<MetricsDto>({
    queryKey: ["analytics-summary", period],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: MetricsDto }>(
          "/api/v1/analytics/summary",
          { params: { period, socialAccountId: PLACEHOLDER_ACCOUNT_ID } }
        );
        return res.data.data;
      } catch {
        return MOCK_METRICS;
      }
    },
  });

  const metrics = data ?? MOCK_METRICS;
  const showConnectBanner = isError && !isLoading;

  // Derive display values
  const bestDay =
    metrics.bestPostingDay != null ? DAYS[metrics.bestPostingDay] : "Thursday";
  const bestHour =
    metrics.bestPostingHour != null
      ? HOURS[metrics.bestPostingHour]
      : "7pm";

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-[24px] font-bold text-gray-900">
            <BarChart3 className="w-6 h-6 text-brand-500" strokeWidth={1.75} />
            Analytics
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Performance metrics for your connected TikTok account.
          </p>
        </div>

        {/* Segmented period selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-0.5">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-lg transition-colors duration-150",
                period === value
                  ? "bg-white shadow-sm font-medium text-gray-900"
                  : "text-gray-500 hover:text-gray-700 font-normal"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Connect TikTok banner (conditional) */}
      {showConnectBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 flex-1">
            Connect your TikTok account to see real analytics data.
          </p>
          <Button variant="primary" size="sm" className="ml-auto">
            Connect TikTok
          </Button>
        </div>
      )}

      {/* 3. KPI Cards Grid (8 cards, 2 rows × 4 cols) */}
      <div
        className={cn(
          "grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-150",
          isFetching && !isLoading && "opacity-60"
        )}
      >
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            {/* Row 1 */}
            <KpiCard
              label="Total Views"
              value={formatNum(metrics.totalViews)}
            />
            <KpiCard
              label="Total Likes"
              value={formatNum(metrics.totalLikes)}
            />
            <KpiCard
              label="Total Comments"
              value={formatNum(metrics.totalComments)}
            />
            <KpiCard
              label="Total Shares"
              value={formatNum(metrics.totalShares)}
            />
            {/* Row 2 */}
            <KpiCard
              label="New Followers"
              value={`+${formatNum(metrics.totalFollowersGained)}`}
            />
            <KpiCard
              label="Avg Engagement"
              value={`${(metrics.avgEngagementRate * 100).toFixed(2)}%`}
            />
            <KpiCard
              label="Best Day"
              value={bestDay}
              sub="highest avg engagement"
              accent
            />
            <KpiCard
              label="Best Hour"
              value={bestHour}
              sub="highest avg engagement"
              accent
            />
          </>
        )}
      </div>

      {/* 4. Top Performing Posts table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden">
        {/* Table header row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[16px] font-semibold text-gray-900">
            Top Performing Posts
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            View all
          </a>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-500 w-14">
                  Thumb
                </th>
                <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Title
                </th>
                <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-500 text-right whitespace-nowrap">
                  Views
                </th>
                <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-500 text-right whitespace-nowrap">
                  Likes
                </th>
                <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-500 text-right whitespace-nowrap">
                  Eng. Rate
                </th>
                <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-500 text-right whitespace-nowrap">
                  Posted
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : (
                MOCK_POSTS.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Thumbnail placeholder */}
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0" />
                    </td>
                    {/* Title */}
                    <td className="px-5 py-3 max-w-[240px]">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </p>
                    </td>
                    {/* Views */}
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm text-gray-600">
                        {formatNum(post.views)}
                      </span>
                    </td>
                    {/* Likes */}
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm text-gray-600">
                        {formatNum(post.likes)}
                      </span>
                    </td>
                    {/* Engagement Rate */}
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-medium text-brand-600">
                        {post.engagementRate.toFixed(1)}%
                      </span>
                    </td>
                    {/* Posted date */}
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs text-gray-400">
                        {formatDate(post.postedAt)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
