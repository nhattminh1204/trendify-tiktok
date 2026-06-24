"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Lightbulb, Plus, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
  EmptyState,
} from "@/components/ui";
import { BoardPipeline, MiniPipeline } from "@/components/content/pipeline-stepper";
import type { StageKey } from "@/components/content/pipeline-stepper";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IdeaStatus = StageKey | "archived";

interface Idea {
  id: string;
  title: string;
  niche: string;
  hook?: string;
  status: IdeaStatus;
  aiGenerated?: boolean;
  scheduledAt?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIPELINE_STAGES: StageKey[] = [
  "draft",
  "approved",
  "ready",
  "in_production",
  "published",
];

const STAGE_LABELS: Record<StageKey, string> = {
  draft: "Draft",
  approved: "Approved",
  ready: "Ready",
  in_production: "In Production",
  published: "Published",
};

const NICHES = ["Fitness", "Cooking", "Tech", "Beauty", "Finance"];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    title: "5 Fitness Myths You Still Believe (Debunked by Science)",
    niche: "Fitness",
    hook: "You've been doing this wrong your entire life…",
    status: "draft",
    aiGenerated: true,
  },
  {
    id: "2",
    title: "The $5 Meal That Beats Any Restaurant — Budget Cooking 101",
    niche: "Cooking",
    hook: "I ate for $20 a week and never felt hungry.",
    status: "approved",
    aiGenerated: false,
  },
  {
    id: "3",
    title: "Hidden iPhone Settings That Will Change How You Use Your Phone",
    niche: "Tech",
    status: "in_production",
    aiGenerated: true,
  },
  {
    id: "4",
    title: "My Skincare Routine That Cleared My Skin in 30 Days",
    niche: "Beauty",
    hook: "Dermatologists don't want you to know this combo…",
    status: "published",
    aiGenerated: false,
  },
  {
    id: "5",
    title: "Save $1,000 This Month Without Changing Your Lifestyle",
    niche: "Finance",
    hook: "Most people skip step 3 and wonder why they're broke.",
    status: "archived",
    aiGenerated: true,
  },
  {
    id: "6",
    title: "10 Minute Home Workout That Beats The Gym",
    niche: "Fitness",
    hook: "No equipment. No excuses. Just results.",
    status: "draft",
    aiGenerated: true,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContentPage() {
  const [showForm, setShowForm] = useState(false);
  const [activeStage, setActiveStage] = useState<StageKey | "all">("all");
  const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
  const [isLoading] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formNiche, setFormNiche] = useState("Fitness");
  const [formHook, setFormHook] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────

  const stageCounts = useMemo(() => {
    return PIPELINE_STAGES.map((key) => ({
      key,
      count: ideas.filter((i) => i.status === key).length,
    }));
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    if (activeStage === "all") {
      return ideas.filter((i) => i.status !== "archived");
    }
    return ideas.filter((i) => i.status === activeStage);
  }, [ideas, activeStage]);

  const archivedCount = ideas.filter((i) => i.status === "archived").length;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setIsCreating(true);
    try {
      const newIdea: Idea = {
        id: String(Date.now()),
        title: formTitle.trim(),
        niche: formNiche,
        hook: formHook.trim() || undefined,
        status: "draft",
        aiGenerated: false,
      };
      setIdeas((prev) => [newIdea, ...prev]);
      setShowForm(false);
      setFormTitle("");
      setFormHook("");
      setFormNiche("Fitness");
      setActiveStage("draft");
    } finally {
      setIsCreating(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, status: "approved" as IdeaStatus } : idea
      )
    );
  };

  const handleStageClick = (stage: StageKey | "all") => {
    setActiveStage(stage);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* 1. Page Header */}
      <div className="flex justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-brand-500" />
            <h1 className="text-[24px] font-bold text-gray-900">Content Ideas</h1>
          </div>
          <p className="text-[14px] text-gray-500 mt-1">
            Theo dõi nội dung của bạn từ ý tưởng đến xuất bản.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/content/generate">
            <Button variant="ai">
              <Sparkles className="w-4 h-4" />
              AI Generate
            </Button>
          </Link>
          <Button
            variant="primary"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="w-4 h-4" />
            New Idea
          </Button>
        </div>
      </div>

      {/* 2. Create Idea Form (collapsible) */}
      {showForm && (
        <Card className="bg-white border-[#C7D2FE] rounded-xl p-5">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">New Content Idea</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Title *"
              placeholder="5 fitness myths debunked"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
            <Select
              label="Niche *"
              value={formNiche}
              onChange={(e) => setFormNiche(e.target.value)}
            >
              {NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
          </div>
          <div className="mt-3">
            <Input
              label="Hook (optional)"
              placeholder="You've been doing this wrong your entire life…"
              value={formHook}
              onChange={(e) => setFormHook(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!formTitle.trim()}
              loading={isCreating}
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </Card>
      )}

      {/* 3. Pipeline Overview */}
      <Card className="bg-white border-gray-200">
        <BoardPipeline
          stages={stageCounts}
          activeStage={activeStage}
          onStageClick={handleStageClick}
        />
      </Card>

      {/* 4. Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-900">
          {activeStage === "all"
            ? "Tất cả nội dung"
            : STAGE_LABELS[activeStage]}
          <span className="text-gray-400 font-normal ml-1">
            ({filteredIdeas.length})
          </span>
        </h2>

        {/* Stage-appropriate action */}
        {activeStage === "draft" && (
          <Link href="/dashboard/content/generate">
            <Button variant="ai" size="sm">
              <Sparkles className="w-3.5 h-3.5" />
              Tạo bằng AI
            </Button>
          </Link>
        )}
        {activeStage === "all" && archivedCount > 0 && (
          <button
            onClick={() => handleStageClick("archived" as any)}
            className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Xem lưu trữ ({archivedCount})
          </button>
        )}
      </div>

      {/* 5. Ideas List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredIdeas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={
            activeStage === "all"
              ? "Chưa có ý tưởng nào."
              : `Chưa có ý tưởng nào ở giai đoạn "${STAGE_LABELS[activeStage as StageKey]}".`
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onApprove={handleApprove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Idea Card
// ---------------------------------------------------------------------------

function IdeaCard({
  idea,
  onApprove,
}: {
  idea: Idea;
  onApprove: (id: string) => void;
}) {
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    await onApprove(idea.id);
    setApproving(false);
  };

  const isArchived = idea.status === "archived";
  const stage = (isArchived ? "draft" : idea.status) as StageKey;

  return (
    <Link href={`/dashboard/content/${idea.id}`}>
      <Card
        variant="interactive"
        className={cn(isArchived && "opacity-60")}
      >
        <div className="flex gap-4">
          {/* Left */}
          <div className="flex-1 min-w-0">
            {/* Badge row */}
            <div className="flex gap-1.5 flex-wrap items-center mb-1.5">
              <Badge variant={idea.status}>{idea.status}</Badge>
              <span className="text-[13px] text-gray-400">{idea.niche}</span>
              {idea.aiGenerated && (
                <Badge variant="ai">AI</Badge>
              )}
              {idea.status === "in_production" && idea.scheduledAt && (
                <Badge variant="scheduled">
                  {new Date(idea.scheduledAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Badge>
              )}
            </div>

            {/* Title */}
            <p className="text-[14px] font-medium text-gray-900">{idea.title}</p>

            {/* Hook */}
            {idea.hook && (
              <p className="text-[13px] italic text-gray-500 mt-1 truncate">
                &ldquo;{idea.hook}&rdquo;
              </p>
            )}

            {/* Mini Pipeline Progress */}
            {!isArchived && (
              <div className="mt-2.5 max-w-[280px]">
                <MiniPipeline status={stage} />
              </div>
            )}
          </div>

          {/* Right — Action */}
          {idea.status === "draft" && (
            <div className="flex-shrink-0 self-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApprove();
                }}
                disabled={approving}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium rounded-lg",
                  "border border-green-300 text-green-700 hover:bg-green-50",
                  "transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </button>
            </div>
          )}

          {idea.status === "approved" && (
            <div className="flex-shrink-0 self-center">
              <Link
                href={`/dashboard/content/${idea.id}/media`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 h-8 px-3 text-[13px] font-medium rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Tiếp tục
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
