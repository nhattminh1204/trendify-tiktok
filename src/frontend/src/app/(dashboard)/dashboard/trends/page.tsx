"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  TrendingUp,
  ChevronDown,
  SearchX,
  Bookmark,
  BookmarkCheck,
  Users,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trendsApi, TrendDto, CompetitorDto } from "@/lib/api/trends";
import { cn } from "@/lib/utils";

const NICHES = ["All", "Fitness", "Cooking", "Tech", "Beauty", "Finance"];
const SORT_OPTIONS = ["Score", "Velocity", "Engagement", "Newest"];
const STATUS_OPTIONS = ["All", "Rising", "Peaked", "Declining"];

type TabView = "all" | "watchlist" | "competitors";

// ─── Shared Components ───────────────────────────────────────────────────────

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

function WatchlistButton({
  trendId,
  isWatched,
}: {
  trendId: string;
  isWatched: boolean;
}) {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: () => trendsApi.addToWatchlist(trendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => trendsApi.removeFromWatchlist(trendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const loading = addMutation.isPending || removeMutation.isPending;

  if (isWatched) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          removeMutation.mutate();
        }}
        disabled={loading}
        className="flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
      >
        <BookmarkCheck className="w-3.5 h-3.5" />
        Watched
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addMutation.mutate();
      }}
      disabled={loading}
      className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-brand-600 transition-colors disabled:opacity-50"
    >
      <Bookmark className="w-3.5 h-3.5" />
      Watch
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TrendsPage() {
  const [tab, setTab] = useState<TabView>("all");
  const [niche, setNiche] = useState("All");
  const [sortOpen, setSortOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sort, setSort] = useState("Score");
  const [statusFilter, setStatusFilter] = useState("All");

  // Competitor form
  const [compUsername, setCompUsername] = useState("");
  const [showCompForm, setShowCompForm] = useState(false);

  const queryClient = useQueryClient();

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["trends", niche],
    queryFn: () => trendsApi.list(niche === "All" ? undefined : niche.toLowerCase()),
    enabled: tab === "all",
  });

  const { data: watchlist, isLoading: watchlistLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => trendsApi.getWatchlist(),
    enabled: tab === "watchlist",
  });

  const { data: competitors, isLoading: compLoading } = useQuery({
    queryKey: ["competitors"],
    queryFn: () => trendsApi.getCompetitors(),
    enabled: tab === "competitors",
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addCompMutation = useMutation({
    mutationFn: (username: string) => trendsApi.addCompetitor(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      setCompUsername("");
      setShowCompForm(false);
    },
  });

  const removeCompMutation = useMutation({
    mutationFn: (id: string) => trendsApi.removeCompetitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
    },
  });

  // ── Derived ───────────────────────────────────────────────────────────────

  const watchedIds = new Set(
    (watchlist ?? []).map((w: { trendDetectionId: string }) => w.trendDetectionId)
  );

  const isLoading =
    tab === "all" ? trendsLoading
    : tab === "watchlist" ? watchlistLoading
    : compLoading;

  // ── Render ────────────────────────────────────────────────────────────────

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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("all")}
          className={cn(
            "px-4 py-1.5 text-[13px] font-medium rounded-lg transition-colors",
            tab === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />
          All Trends
        </button>
        <button
          onClick={() => setTab("watchlist")}
          className={cn(
            "px-4 py-1.5 text-[13px] font-medium rounded-lg transition-colors",
            tab === "watchlist" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <BookmarkCheck className="w-3.5 h-3.5 inline mr-1.5" />
          My Watchlist
          {watchlist && watchlist.length > 0 && (
            <span className="ml-1.5 text-[11px] text-brand-600 font-semibold">
              ({watchlist.length})
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("competitors")}
          className={cn(
            "px-4 py-1.5 text-[13px] font-medium rounded-lg transition-colors",
            tab === "competitors" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Users className="w-3.5 h-3.5 inline mr-1.5" />
          Competitors
          {competitors && competitors.length > 0 && (
            <span className="ml-1.5 text-[11px] text-brand-600 font-semibold">
              ({competitors.length})
            </span>
          )}
        </button>
      </div>

      {/* ── ALL TRENDS ─────────────────────────────────────────────────── */}
      {tab === "all" && (
        <>
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

          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="secondary" size="sm" onClick={() => { setSortOpen(v => !v); setStatusOpen(false); }}>
                Sort: {sort} <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 z-20 w-36 bg-white border border-gray-200 rounded-xl shadow-elevated py-1">
                    {SORT_OPTIONS.map((o) => (
                      <button key={o} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => { setSort(o); setSortOpen(false); }}>
                        {o}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <Button variant="secondary" size="sm" onClick={() => { setStatusOpen(v => !v); setSortOpen(false); }}>
                Status: {statusFilter} <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              {statusOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 z-20 w-36 bg-white border border-gray-200 rounded-xl shadow-elevated py-1">
                    {STATUS_OPTIONS.map((o) => (
                      <button key={o} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => { setStatusFilter(o); setStatusOpen(false); }}>
                        {o}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span className="flex-1" />
            <span className="text-[13px] text-gray-400">{trends?.length ?? 0} trends</span>
          </div>
        </>
      )}

      {/* ── WATCHLIST ─────────────────────────────────────────────── */}
      {tab === "watchlist" && (
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-brand-500" />
          <span className="text-[13px] text-gray-500">
            Trends you&apos;re watching — score updates in real time.
          </span>
          <span className="flex-1" />
          <span className="text-[13px] text-gray-400">{watchlist?.length ?? 0} watched</span>
        </div>
      )}

      {/* ── COMPETITORS ──────────────────────────────────────────── */}
      {tab === "competitors" && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            <span className="text-[13px] text-gray-500">
              TikTok accounts you&apos;re monitoring for content inspiration.
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowCompForm(v => !v)}>
            <Plus className="w-3.5 h-3.5" />
            Add Competitor
          </Button>
        </div>
      )}

      {/* ── Add Competitor Form ──────────────────────────────────── */}
      {tab === "competitors" && showCompForm && (
        <Card className="bg-white border-brand-200 p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Add TikTok account</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input
                value={compUsername}
                onChange={(e) => setCompUsername(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="w-full h-9 pl-7 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && compUsername.trim()) addCompMutation.mutate(compUsername.trim());
                }}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={addCompMutation.isPending}
              disabled={!compUsername.trim()}
              onClick={() => addCompMutation.mutate(compUsername.trim())}
            >
              Add
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowCompForm(false); setCompUsername(""); }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* ── Content Grid ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : !dataExists() ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-[15px] font-medium text-gray-500">{emptyTitle()}</p>
          <p className="text-sm text-gray-400 mt-1">{emptySubtitle()}</p>
        </div>
      ) : tab === "competitors" ? (
        /* ── Competitors Grid ───────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(competitors ?? []).map((c: CompetitorDto) => (
            <Card key={c.id} padding="md" className="h-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
                  {c.displayName?.[0] ?? c.tiktokUsername[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">@{c.tiktokUsername}</p>
                      {c.displayName && (
                        <p className="text-xs text-gray-400">{c.displayName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeCompMutation.mutate(c.id)}
                      className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-3 mt-2.5 text-[12px]">
                    {c.followerCount != null && (
                      <span className="text-gray-500">
                        <span className="font-semibold text-gray-700">
                          {c.followerCount >= 1000000
                            ? `${(c.followerCount / 1000000).toFixed(1)}M`
                            : c.followerCount >= 1000
                            ? `${(c.followerCount / 1000).toFixed(0)}K`
                            : c.followerCount}
                        </span> followers
                      </span>
                    )}
                    {c.lastScannedAt && (
                      <span className="text-gray-400">
                        Scanned {Math.floor((Date.now() - new Date(c.lastScannedAt).getTime()) / (1000 * 60 * 60))}h ago
                      </span>
                    )}
                  </div>

                  {c.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">{c.notes}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <a
                      href={`https://tiktok.com/@${c.tiktokUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View profile
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* ── Trends / Watchlist Grid ─────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(tab === "all" ? (trends ?? []) : (watchlist ?? [])).map((t: any) => {
            const trendId = t.trendDetectionId ?? t.id;
            const keyword = t.keyword;
            const isWatched = watchedIds.has(trendId);

            return (
              <Link key={trendId} href={`/dashboard/trends/${trendId}`}>
                <Card variant="interactive" padding="md" className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                        #{keyword.replace(/\s+/g, "")}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.niche} · TikTok</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={t.status as "rising" | "peaked" | "declining" | "expired"}>{t.status}</Badge>
                      <WatchlistButton trendId={trendId} isWatched={isWatched} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <ScoreBar label="Score"      value={t.score} />
                    <ScoreBar label="Velocity"   value={t.velocityScore ?? 0} />
                    <ScoreBar label="Engagement" value={t.engagementScore ?? 0} />
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-50">
                    <span className="text-xs text-brand-600 hover:underline">View details →</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Helper functions ─────────────────────────────────────────────────────

  function dataExists(): boolean {
    if (tab === "all") return (trends?.length ?? 0) > 0;
    if (tab === "watchlist") return (watchlist?.length ?? 0) > 0;
    return (competitors?.length ?? 0) > 0;
  }

  function emptyTitle(): string {
    if (tab === "all") return "No trends found for this niche yet.";
    if (tab === "watchlist") return "Your watchlist is empty.";
    return "No competitors added yet.";
  }

  function emptySubtitle(): string {
    if (tab === "all") return "Try a different niche or status filter.";
    if (tab === "watchlist") return 'Click the bookmark icon on any trend to start watching.';
    return 'Click "Add Competitor" to start monitoring a TikTok account.';
  }
}
