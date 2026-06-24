"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Check, Package, Film, Bot, Sparkles, ChevronRight, ChevronLeft,
  Search, BadgeCheck, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { videoApi, TemplateDto, CreateRenderJobPayload } from "@/lib/api/video";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const STEPS = ["Script", "Template", "Voice", "Review"];

const MOCK_PRODUCTS = [
  { id: "p1", name: "Váy Hoa Mùa Hè Premium", category: "Váy & Đầm", productType: "fashion_female", commissionRate: 20 },
  { id: "p2", name: "Đồng hồ Cơ Classic Gold", category: "Đồng hồ", productType: "watch", commissionRate: 15 },
  { id: "p3", name: "Túi Da Thật Luxury", category: "Túi xách", productType: "handbag", commissionRate: 18 },
  { id: "p4", name: "Son Môi Lì Matte 24H", category: "Son môi", productType: "cosmetics", commissionRate: 25 },
  { id: "p5", name: "Áo Khoác Bomber Unisex", category: "Áo khoác", productType: "fashion_female", commissionRate: 22 },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.slice(0, total).map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  done ? "bg-brand-600 text-white" : active ? "bg-brand-600 text-white" : "bg-white border-2 border-gray-200 text-gray-400"
                )}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-[11px] font-medium mt-1.5 whitespace-nowrap", done || active ? "text-brand-600" : "text-gray-400")}>
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div className={cn("w-16 h-0.5 mb-5 mx-1", i < current ? "bg-brand-600" : "bg-gray-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepScript({
  scriptText, setScriptText,
}: {
  scriptText: string;
  setScriptText: (v: string) => void;
}) {
  const charCount = scriptText.length;
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Write your script</h2>
      <p className="text-sm text-gray-500 mb-5">The TTS engine will narrate this text over the video.</p>
      <Textarea
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
        placeholder="Enter your video script here…"
        rows={8}
      />
      <p className="text-xs text-gray-400 mt-1.5 text-right">{charCount} / 10000 characters</p>
    </div>
  );
}

function StepTemplate({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["video-templates"],
    queryFn: () => videoApi.listTemplates(),
  });

  if (isLoading) {
    return <div className="text-center py-8 text-sm text-gray-400">Loading templates…</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose a template</h2>
      <p className="text-sm text-gray-500 mb-5">Select the video structure that fits your content.</p>
      {!templates || templates.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Film className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No templates available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                selected === t.id
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="w-full aspect-video rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                <Film className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-xs font-semibold text-gray-900 truncate">{t.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {t.videoStyle && (
                  <span className="text-[10px] font-medium text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                    {t.videoStyle}
                  </span>
                )}
                {t.estimatedDurationSeconds && (
                  <span className="text-[10px] text-gray-400">{t.estimatedDurationSeconds}s</span>
                )}
              </div>
              {selected === t.id && (
                <div className="mt-1.5">
                  <BadgeCheck className="w-4 h-4 text-brand-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StepVoice({
  engine, setEngine,
  voiceId, setVoiceId,
}: {
  engine: string;
  setEngine: (v: string) => void;
  voiceId: string;
  setVoiceId: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose voice</h2>
      <p className="text-sm text-gray-500 mb-5">Select TTS engine and voice for narration.</p>
      <div className="space-y-4">
        <Select label="TTS Engine" value={engine} onChange={(e) => setEngine(e.target.value)}>
          <option value="edge">Edge TTS (free)</option>
          <option value="openai">OpenAI TTS</option>
          <option value="omnivoice">OmniVoice VI</option>
        </Select>
        <Input label="Voice ID" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} placeholder="vi-VN-HoaiMyNeural" />
      </div>
    </div>
  );
}

function StepReview({
  scriptText, templateId, engine, voiceId,
  onGenerate, loading,
}: {
  scriptText: string;
  templateId: string;
  engine: string;
  voiceId: string;
  onGenerate: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Review & Generate</h2>
      <p className="text-sm text-gray-500 mb-5">Confirm your selections before creating the render job.</p>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
            <Film className="w-4 h-4 text-violet-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">Template</p>
            <p className="text-sm font-medium text-gray-900">{templateId}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-brand-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">Voice</p>
            <p className="text-sm font-medium text-gray-900">{voiceId}</p>
            <p className="text-xs text-gray-400">{engine}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">Script</p>
            <p className="text-sm text-gray-700 line-clamp-3">{scriptText}</p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 items-start mb-5">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          The render job will run in the background. Check progress in <strong>Render Jobs</strong>.
        </p>
      </div>

      <Button
        onClick={onGenerate}
        loading={loading}
        fullWidth
        className="bg-violet-600 hover:bg-violet-700"
      >
        {loading ? "Creating…" : (
          <><Sparkles className="w-4 h-4" /> Generate video</>
        )}
      </Button>
    </div>
  );
}

export default function StudioGeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [scriptText, setScriptText] = useState("");
  const [templateId, setTemplateId] = useState(searchParams.get("template_id") || "");
  const [engine, setEngine] = useState("edge");
  const [voiceId, setVoiceId] = useState("vi-VN-HoaiMyNeural");
  const totalSteps = 4;

  const canNext = [
    scriptText.trim().length > 0 && scriptText.length <= 10000,
    !!templateId,
    !!engine && !!voiceId,
    true,
  ][step];

  const createMutation = useMutation({
    mutationFn: () => videoApi.createJob({
      templateId, voiceId, ttsEngine: engine, scriptText,
    }),
    onSuccess: (id) => {
      toast("success", `Render job created (${id.slice(0, 8)}…)`);
      router.push("/dashboard/studio/jobs");
    },
    onError: (err: any) => {
      toast("error", err?.response?.data?.message || "Failed to create job");
    },
  });

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Video</h1>
        <p className="text-sm text-gray-500 mt-1">Turn your script into a TikTok video with AI.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <StepIndicator current={step} total={totalSteps} />

        <div className="min-h-[320px]">
          {step === 0 && (
            <StepScript scriptText={scriptText} setScriptText={setScriptText} />
          )}
          {step === 1 && (
            <StepTemplate selected={templateId} onSelect={setTemplateId} />
          )}
          {step === 2 && (
            <StepVoice engine={engine} setEngine={setEngine} voiceId={voiceId} setVoiceId={setVoiceId} />
          )}
          {step === 3 && (
            <StepReview
              scriptText={scriptText}
              templateId={templateId}
              engine={engine}
              voiceId={voiceId}
              onGenerate={() => createMutation.mutate()}
              loading={createMutation.isPending}
            />
          )}
        </div>

        {step < totalSteps - 1 && (
          <div className="flex justify-between mt-6 pt-5 border-t border-gray-100">
            <Button variant="secondary" onClick={handleBack} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={handleNext} disabled={!canNext}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
