"use client";

import { useState } from "react";
import { Zap, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderStatus = "active" | "fallback" | "disabled";

interface Provider {
  name: string;
  status: ProviderStatus;
  latency: string;
  calls: string;
}

type LogStatus = "ok" | "fail";

interface UsageLog {
  id: string;
  feature: string;
  provider: string;
  model: string;
  tokens: number;
  cost: number;
  duration: string;
  status: LogStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BUDGET = {
  spent: 12.5,
  limit: 50.0,
  isWarning: false,
};

const PROVIDERS: Provider[] = [
  { name: "OpenAI", status: "active", latency: "234ms", calls: "1,240" },
  { name: "Anthropic", status: "fallback", latency: "189ms", calls: "87" },
  { name: "Gemini", status: "disabled", latency: "-", calls: "0" },
];

const USAGE_SUMMARY = {
  totalTokens: 127430,
  totalCost: 0.0234,
};

const TOTAL_PAGES = 3;
const PAGE_SIZE = 8;

const ALL_LOGS: UsageLog[] = [
  // Page 1
  {
    id: "l1",
    feature: "Trend Score Calc",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 832,
    cost: 0.000166,
    duration: "421ms",
    status: "ok",
  },
  {
    id: "l2",
    feature: "Script Generator",
    provider: "Anthropic",
    model: "claude-3-haiku",
    tokens: 2140,
    cost: 0.000321,
    duration: "1,102ms",
    status: "ok",
  },
  {
    id: "l3",
    feature: "AI Insights",
    provider: "OpenAI",
    model: "gpt-4o",
    tokens: 3508,
    cost: 0.01053,
    duration: "2,341ms",
    status: "ok",
  },
  {
    id: "l4",
    feature: "Learning Engine",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 1024,
    cost: 0.000205,
    duration: "634ms",
    status: "ok",
  },
  {
    id: "l5",
    feature: "Hashtag Suggest",
    provider: "Gemini",
    model: "gemini-flash",
    tokens: 512,
    cost: 0.000051,
    duration: "298ms",
    status: "fail",
  },
  {
    id: "l6",
    feature: "Script Generator",
    provider: "Anthropic",
    model: "claude-3-5-sonnet",
    tokens: 4096,
    cost: 0.01229,
    duration: "3,120ms",
    status: "ok",
  },
  {
    id: "l7",
    feature: "Trend Score Calc",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 716,
    cost: 0.000143,
    duration: "389ms",
    status: "ok",
  },
  {
    id: "l8",
    feature: "AI Insights",
    provider: "OpenAI",
    model: "gpt-4o",
    tokens: 2980,
    cost: 0.00894,
    duration: "1,890ms",
    status: "ok",
  },
  // Page 2
  {
    id: "l9",
    feature: "Trend Score Calc",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 900,
    cost: 0.00018,
    duration: "455ms",
    status: "ok",
  },
  {
    id: "l10",
    feature: "Script Generator",
    provider: "Anthropic",
    model: "claude-3-haiku",
    tokens: 1800,
    cost: 0.00027,
    duration: "988ms",
    status: "ok",
  },
  {
    id: "l11",
    feature: "AI Insights",
    provider: "OpenAI",
    model: "gpt-4o",
    tokens: 3100,
    cost: 0.0093,
    duration: "2,100ms",
    status: "fail",
  },
  {
    id: "l12",
    feature: "Learning Engine",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 1100,
    cost: 0.00022,
    duration: "710ms",
    status: "ok",
  },
  {
    id: "l13",
    feature: "Hashtag Suggest",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 640,
    cost: 0.000128,
    duration: "322ms",
    status: "ok",
  },
  {
    id: "l14",
    feature: "Script Generator",
    provider: "Anthropic",
    model: "claude-3-5-sonnet",
    tokens: 3800,
    cost: 0.01140,
    duration: "2,900ms",
    status: "ok",
  },
  {
    id: "l15",
    feature: "Trend Score Calc",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 750,
    cost: 0.00015,
    duration: "401ms",
    status: "ok",
  },
  {
    id: "l16",
    feature: "AI Insights",
    provider: "OpenAI",
    model: "gpt-4o",
    tokens: 2700,
    cost: 0.0081,
    duration: "1,750ms",
    status: "ok",
  },
  // Page 3
  {
    id: "l17",
    feature: "Trend Score Calc",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 810,
    cost: 0.000162,
    duration: "430ms",
    status: "ok",
  },
  {
    id: "l18",
    feature: "Script Generator",
    provider: "Anthropic",
    model: "claude-3-haiku",
    tokens: 2200,
    cost: 0.00033,
    duration: "1,050ms",
    status: "ok",
  },
  {
    id: "l19",
    feature: "AI Insights",
    provider: "OpenAI",
    model: "gpt-4o",
    tokens: 3300,
    cost: 0.0099,
    duration: "2,200ms",
    status: "ok",
  },
  {
    id: "l20",
    feature: "Learning Engine",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 950,
    cost: 0.00019,
    duration: "620ms",
    status: "fail",
  },
  {
    id: "l21",
    feature: "Hashtag Suggest",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 580,
    cost: 0.000116,
    duration: "301ms",
    status: "ok",
  },
  {
    id: "l22",
    feature: "Script Generator",
    provider: "Anthropic",
    model: "claude-3-5-sonnet",
    tokens: 4100,
    cost: 0.01230,
    duration: "3,010ms",
    status: "ok",
  },
  {
    id: "l23",
    feature: "Trend Score Calc",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    tokens: 780,
    cost: 0.000156,
    duration: "412ms",
    status: "ok",
  },
  {
    id: "l24",
    feature: "AI Insights",
    provider: "OpenAI",
    model: "gpt-4o",
    tokens: 2900,
    cost: 0.0087,
    duration: "1,920ms",
    status: "ok",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROVIDER_STATUS_VARIANT: Record<ProviderStatus, "success" | "warning" | "default"> = {
  active: "success",
  fallback: "warning",
  disabled: "default",
};

const TABLE_COLS = [
  "Feature",
  "Provider",
  "Model",
  "Tokens",
  "Cost",
  "Duration",
  "Status",
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIEnginePage() {
  const [isLoading] = useState(false);
  const [page, setPage] = useState(1);

  const spentPct = (BUDGET.spent / BUDGET.limit) * 100;
  const isWarning = spentPct >= 80;

  const pageStart = (page - 1) * PAGE_SIZE;
  const pageRows = ALL_LOGS.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <Zap className="w-[22px] h-[22px] text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900">AI Engine</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Monitor your AI usage, costs, and provider health.
        </p>
      </div>

      {/* ── Budget Card ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : (
        <div
          className={cn(
            "rounded-xl border p-5",
            isWarning
              ? "bg-amber-50 border-amber-200"
              : "bg-white border-gray-200"
          )}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isWarning && (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
              <span
                className={cn(
                  "text-sm font-semibold",
                  isWarning ? "text-amber-700" : "text-gray-900"
                )}
              >
                Monthly AI Budget
              </span>
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                isWarning ? "text-amber-700" : "text-gray-900"
              )}
            >
              ${BUDGET.spent.toFixed(2)} / ${BUDGET.limit.toFixed(2)}
            </span>
          </div>
          <ProgressBar value={spentPct} size="md" className="mt-2.5" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">{spentPct.toFixed(1)}% used</span>
            <span className="text-xs text-gray-400">
              ${(BUDGET.limit - BUDGET.spent).toFixed(2)} remaining
            </span>
          </div>
        </div>
      )}

      {/* ── Provider Status Row ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PROVIDERS.map((p) => (
            <Card key={p.name} padding="md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                <Badge variant={PROVIDER_STATUS_VARIANT[p.status]}>
                  {p.status}
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Avg latency</span>
                <span>{p.latency}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Calls today</span>
                <span>{p.calls}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Usage Summary ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tokens</p>
          <p className="text-[22px] font-bold text-gray-900 mt-1">
            {USAGE_SUMMARY.totalTokens.toLocaleString()}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Cost</p>
          <p className="text-[22px] font-bold text-gray-900 mt-1">
            ${USAGE_SUMMARY.totalCost.toFixed(4)}
          </p>
        </Card>
      </div>

      {/* ── Usage Log Table ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {TABLE_COLS.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">
                      {row.provider}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {row.model}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {row.tokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      ${row.cost.toFixed(5)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">
                      {row.duration}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={row.status === "ok" ? "success" : "danger"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center px-4 py-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </Button>
          <span className="text-[13px] text-gray-500">
            Page {page} of {TOTAL_PAGES}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= TOTAL_PAGES}
            onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
