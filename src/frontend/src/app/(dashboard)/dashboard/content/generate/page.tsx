"use client";

import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Info,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Select, Toggle, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContentFormat = "short" | "standard" | "long";
type OutputState = "empty" | "loading" | "generated";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FORMAT_OPTIONS: { value: ContentFormat; label: string }[] = [
  { value: "short",    label: "Short (15-30s)" },
  { value: "standard", label: "Standard (30-60s)" },
  { value: "long",     label: "Long (60-90s)" },
];

const TONE_OPTIONS = [
  "Energetic",
  "Educational",
  "Funny",
  "Inspiring",
  "Controversial",
];

const AUDIENCE_OPTIONS = [
  "General",
  "Fitness Enthusiasts",
  "Young Adults",
  "Professionals",
];

const HASHTAGS = [
  "#fitness",
  "#fitnessmyths",
  "#workout",
  "#healthylifestyle",
  "#gymtips",
  "#fitnesstips",
];

const SCRIPT_SECTIONS = [
  {
    number: 1,
    label: "Hook",
    timing: "(0-3s)",
    content: "You've been doing this wrong your entire life…",
  },
  {
    number: 2,
    label: "Problem Setup",
    timing: "(3-10s)",
    content: "Most people think cardio is everything when it comes to getting fit. Spoiler: it's not.",
  },
  {
    number: 3,
    label: "Main Content",
    timing: "(10-45s)",
    content:
      "Here are 5 fitness myths: Myth 1 — Cardio is the only way to lose fat. Myth 2 — Lifting makes you bulky. Myth 3 — You need to train every day. Myth 4 — Protein shakes are essential. Myth 5 — Spot reduction works.",
  },
  {
    number: 4,
    label: "CTA",
    timing: "(45-60s)",
    content: "Follow for more fitness science — and drop a comment with the myth that surprised you most!",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIScriptGeneratorPage() {
  // Form state
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<ContentFormat>("standard");
  const [tone, setTone] = useState("Energetic");
  const [audience, setAudience] = useState("General");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCta, setIncludeCta] = useState(false);
  const [ctaText, setCtaText] = useState("");
  const [topicError, setTopicError] = useState("");

  // Output state
  const [outputState, setOutputState] = useState<OutputState>("empty");
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleGenerate = () => {
    if (!topic.trim()) {
      setTopicError("Topic is required.");
      return;
    }
    setTopicError("");
    setOutputState("loading");
    setTimeout(() => {
      setOutputState("generated");
    }, 2000);
  };

  const handleRegenerate = () => {
    setOutputState("loading");
    setTimeout(() => {
      setOutputState("generated");
    }, 2000);
  };

  const handleCopyAll = () => {
    const text = [
      "HOOK",
      "You've been doing this wrong your entire life…",
      "",
      "SCRIPT OUTLINE",
      ...SCRIPT_SECTIONS.map(
        (s) => `${s.number}. ${s.label} ${s.timing}: ${s.content}`
      ),
      "",
      "HASHTAGS",
      HASHTAGS.join(" "),
    ].join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-5">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-500" />
          <h1 className="text-[24px] font-bold text-gray-900">AI Script Generator</h1>
        </div>
        <p className="text-[14px] text-gray-500 mt-1">
          Generate hooks, scripts, and hashtags powered by AI.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-6 items-start">

        {/* LEFT — Input Form */}
        <Card className="bg-white border-gray-200 p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-5">Content brief</h2>

          {/* Topic */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">
              Topic or trend <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder='e.g. "5 fitness myths debunked"'
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (e.target.value.trim()) setTopicError("");
              }}
              error={topicError}
            />
            <button
              className="text-[12px] text-brand-600 hover:underline self-start"
              onClick={() => setTopic("5 fitness myths debunked")}
              type="button"
            >
              Use a trending topic
            </button>
          </div>

          {/* Content format */}
          <div className="mt-4">
            <label className="text-[13px] font-medium text-gray-700 block mb-2">
              Content format
            </label>
            <div className="flex gap-2 flex-wrap">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[13px] font-medium border cursor-pointer transition-colors",
                    format === opt.value
                      ? "bg-brand-50 border-brand-500 text-brand-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="mt-4">
            <Select
              label="Tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>

          {/* Target audience */}
          <div className="mt-4">
            <Select
              label="Target audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              {AUDIENCE_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </div>

          {/* Toggle rows */}
          <div className="mt-4 flex flex-col gap-4">
            {/* Include hashtags */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[13px] font-medium text-gray-700">Include hashtags</p>
                <p className="text-[12px] text-gray-400">Auto-generate relevant hashtags</p>
              </div>
              <Toggle checked={includeHashtags} onChange={setIncludeHashtags} />
            </div>

            {/* Include CTA */}
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[13px] font-medium text-gray-700">Include CTA</p>
                  <p className="text-[12px] text-gray-400">Add a call-to-action at the end</p>
                </div>
                <Toggle checked={includeCta} onChange={setIncludeCta} />
              </div>
              {includeCta && (
                <div className="mt-3">
                  <Input
                    placeholder="Subscribe for more…"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Token cost */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span className="text-xs text-gray-400">
              Estimated cost: ~$0.0012 · ~850 tokens
            </span>
          </div>

          {/* Generate button */}
          <Button
            variant="ai"
            size="lg"
            fullWidth
            className="mt-4"
            loading={outputState === "loading"}
            onClick={handleGenerate}
          >
            {outputState === "loading" ? (
              "Generating…"
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </Button>
        </Card>

        {/* RIGHT — Output Preview */}
        <Card className="bg-white border-gray-200 p-6 min-h-[400px] flex flex-col">

          {/* EMPTY state */}
          {outputState === "empty" && (
            <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
              <Sparkles className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-[14px] text-gray-400">
                Fill in the brief and click Generate
              </p>
              <p className="text-[13px] text-gray-300 mt-1">
                Your script will appear here
              </p>
            </div>
          )}

          {/* LOADING state */}
          {outputState === "loading" && (
            <div className="flex flex-col gap-3 py-6 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                <span className="text-[13px] text-gray-500">Generating your script…</span>
              </div>
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-4 w-[50%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[65%]" />
              <Skeleton className="h-4 w-[55%]" />
            </div>
          )}

          {/* GENERATED state */}
          {outputState === "generated" && (
            <div className="flex flex-col flex-1">

              {/* Hook */}
              <div className="border-t-[3px] border-violet-500 pt-3 mb-5">
                <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wide mb-1">
                  Hook
                </p>
                <p className="text-[16px] font-medium text-gray-900 italic">
                  &ldquo;You&apos;ve been doing this wrong your entire life…&rdquo;
                </p>
              </div>

              {/* Script outline */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Script Outline
                </p>
                <div className="flex flex-col gap-3">
                  {SCRIPT_SECTIONS.map((section) => (
                    <div key={section.number} className="flex gap-3">
                      <span className="text-[13px] font-semibold text-brand-600 flex-shrink-0 w-4">
                        {section.number}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-gray-900">
                            {section.label}
                          </span>
                          <span className="text-[11px] text-gray-400">{section.timing}</span>
                        </div>
                        <p className="text-[13px] text-gray-600 mt-0.5">{section.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              {includeHashtags && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Hashtags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {HASHTAGS.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 rounded-full px-3 py-0.5 text-[12px] text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-100 pt-4 mt-5 flex flex-col gap-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-[12px] text-gray-400">842 tokens · $0.0011</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleRegenerate}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCopyAll}>
                      <Copy className="w-3.5 h-3.5" />
                      Copy all
                    </Button>
                  </div>
                </div>

                {/* Primary CTA — start creation flow */}
                <button
                  onClick={() => router.push("/dashboard/content/mock-idea-1/media")}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[14px] font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Lưu & Bắt đầu tạo nội dung
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push("/dashboard/content")}
                  className="w-full text-center text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Chỉ lưu ý tưởng
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
