"use client";

import { useState } from "react";
import {
  GraduationCap,
  Lightbulb,
  CheckCircle2,
  XCircle,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "low" | "medium" | "high" | "critical";

interface Recommendation {
  id: string;
  title: string;
  priority: Priority;
  category: string;
  expected: number;
  desc: string;
  dismissed: boolean;
  applied: boolean;
}

interface Pattern {
  id: string;
  name: string;
  category: string;
  n: number;
  engagement: number;
  confidence: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_RECS: Recommendation[] = [
  {
    id: "r1",
    title: "Post at 7pm Thursday",
    priority: "high",
    category: "Timing",
    expected: 23,
    desc: "Your audience is most active on Thursday evenings — posting here lifts reach by ~23%.",
    dismissed: false,
    applied: false,
  },
  {
    id: "r2",
    title: "Use hook questions",
    priority: "medium",
    category: "Format",
    expected: 15,
    desc: "Questions in hooks get 2x retention through the first 3 seconds.",
    dismissed: false,
    applied: false,
  },
  {
    id: "r3",
    title: "Add trending sound",
    priority: "low",
    category: "Audio",
    expected: 8,
    desc: "Trending sounds boost discovery by surfacing your content in the sound's feed.",
    dismissed: false,
    applied: false,
  },
];

const PATTERNS: Pattern[] = [
  {
    id: "p1",
    name: "7pm Thursday posts",
    category: "Timing",
    n: 47,
    engagement: 6.2,
    confidence: 89,
  },
  {
    id: "p2",
    name: "Question hooks",
    category: "Format",
    n: 31,
    engagement: 5.8,
    confidence: 76,
  },
  {
    id: "p3",
    name: "30–60s videos",
    category: "Length",
    n: 28,
    engagement: 5.1,
    confidence: 71,
  },
  {
    id: "p4",
    name: "Fitness myths topic",
    category: "Topic",
    n: 19,
    engagement: 7.4,
    confidence: 83,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_VARIANT: Record<Priority, "default" | "info" | "warning" | "danger"> = {
  low: "default",
  medium: "info",
  high: "warning",
  critical: "danger",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const [isLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>(INITIAL_RECS);

  const pending = recs.filter((r) => !r.dismissed && !r.applied);

  function handleApply(id: string) {
    setRecs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, applied: true } : r))
    );
  }

  function handleDismiss(id: string) {
    setRecs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, dismissed: true } : r))
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-[22px] h-[22px] text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900">Learning Engine</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          AI-detected content patterns and personalized improvement recommendations.
        </p>
      </div>

      {/* ── Recommendations ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
          {pending.length > 0 && (
            <Badge variant="brand">{pending.length} pending</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No pending recommendations. Keep creating!"
            className="p-12"
          />
        ) : (
          <div className="space-y-3">
            {pending.map((rec) => (
              <div
                key={rec.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4"
              >
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant={PRIORITY_VARIANT[rec.priority]}>
                      {rec.priority}
                    </Badge>
                    <span className="text-xs text-gray-400">{rec.category}</span>
                    <span className="ml-auto text-xs font-semibold text-green-600">
                      +{rec.expected}% expected
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                  <p className="text-[13px] text-gray-500 mt-1">{rec.desc}</p>
                </div>

                {/* Right */}
                <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center">
                  <button
                    onClick={() => handleApply(rec.id)}
                    className={cn(
                      "border border-green-300 text-green-700 hover:bg-green-50",
                      "rounded-lg h-8 px-2.5 text-xs font-medium",
                      "flex items-center gap-1 transition-colors"
                    )}
                  >
                    <CheckCircle2 className="w-[14px] h-[14px]" />
                    Apply
                  </button>
                  <button
                    onClick={() => handleDismiss(rec.id)}
                    className={cn(
                      "border border-gray-200 text-gray-500 hover:bg-gray-50",
                      "rounded-lg h-8 px-2.5 text-xs font-medium",
                      "flex items-center gap-1 transition-colors"
                    )}
                  >
                    <XCircle className="w-[14px] h-[14px]" />
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Learned Patterns ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Learned Patterns
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : PATTERNS.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No patterns yet"
            subtitle="Patterns will appear once enough content has been analyzed."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PATTERNS.map((p) => (
              <Card key={p.id} padding="md">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="default">{p.category}</Badge>
                  <span className="text-xs text-gray-400 ml-auto">n={p.n}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <div className="mt-3 pt-2.5 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {p.engagement}% avg engagement · {p.confidence}% confidence
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
