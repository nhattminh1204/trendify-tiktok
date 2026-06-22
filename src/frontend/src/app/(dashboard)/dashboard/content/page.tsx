"use client";

import { useState } from "react";
import { Lightbulb, Plus, Sparkles, CheckCircle } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IdeaStatus = "draft" | "approved" | "scheduled" | "published" | "archived";

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

const TABS: Array<{ value: IdeaStatus | "all"; label: string }> = [
  { value: "all",       label: "All" },
  { value: "draft",     label: "Draft" },
  { value: "approved",  label: "Approved" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived",  label: "Archived" },
];

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
    status: "scheduled",
    aiGenerated: true,
    scheduledAt: "2026-06-25T10:00:00Z",
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
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContentPage() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<IdeaStatus | "all">("all");
  const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
  const [isLoading] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formNiche, setFormNiche] = useState("Fitness");
  const [formHook, setFormHook] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setIsCreating(true);
    try {
      // API call (mock fallback)
      // await apiClient.post("/api/v1/content/ideas", { title: formTitle, niche: formNiche, hook: formHook });
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
    } catch {
      // silently ignore in mock mode
    } finally {
      setIsCreating(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      // await apiClient.post(`/api/v1/content/ideas/${id}/approve`);
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === id ? { ...idea, status: "approved" as IdeaStatus } : idea
        )
      );
    } catch {
      // silently ignore in mock mode
    }
  };

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const filteredIdeas =
    activeTab === "all"
      ? ideas
      : ideas.filter((idea) => idea.status === activeTab);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            Manage your content pipeline from idea to publish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ai"
            onClick={() => {}}
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Button>
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

      {/* 3. Segmented Tabs */}
      <div className="bg-gray-100 rounded-xl p-1 inline-flex gap-1 flex-wrap">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={cn(
              "px-4 py-1.5 text-[13px] font-medium rounded-lg transition-colors",
              activeTab === value
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 4. Ideas List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredIdeas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No ideas yet. Create your first one above."
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
// Idea Card sub-component
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:border-gray-300 cursor-pointer transition-colors">
      {/* Left */}
      <div className="flex-1 min-w-0">
        {/* Badge row */}
        <div className="flex gap-1.5 flex-wrap items-center mb-1.5">
          <Badge variant={idea.status}>{idea.status}</Badge>
          <span className="text-[13px] text-gray-400">{idea.niche}</span>
          {idea.aiGenerated && (
            <Badge variant="ai">AI</Badge>
          )}
          {idea.status === "scheduled" && idea.scheduledAt && (
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
      </div>

      {/* Right — Approve button (draft only) */}
      {idea.status === "draft" && (
        <div className="flex-shrink-0 self-center">
          <button
            onClick={(e) => {
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
    </div>
  );
}
