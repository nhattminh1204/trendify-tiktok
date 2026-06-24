"use client";

import Link from "next/link";
import { Check, FileText, Video, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type StageKey = "draft" | "approved" | "ready" | "in_production" | "published";

interface StageDef {
  key: StageKey;
  num: number;
  label: string;
  icon: React.ReactNode;
}

const STAGES: StageDef[] = [
  { key: "draft", num: 1, label: "Script", icon: <FileText className="w-3.5 h-3.5" /> },
  { key: "approved", num: 2, label: "Media", icon: <Video className="w-3.5 h-3.5" /> },
  { key: "ready", num: 3, label: "Caption", icon: <MessageCircle className="w-3.5 h-3.5" /> },
  { key: "in_production", num: 4, label: "Sản xuất", icon: <Send className="w-3.5 h-3.5" /> },
  { key: "published", num: 5, label: "Đã đăng", icon: <Check className="w-3.5 h-3.5" /> },
];

function stageHref(id: string, key: StageKey): string {
  const map: Record<StageKey, string> = {
    draft: `/dashboard/content/${id}`,
    approved: `/dashboard/content/${id}/media`,
    ready: `/dashboard/content/${id}/caption`,
    in_production: `/dashboard/content/${id}/publish`,
    published: `/dashboard/content/${id}/publish`,
  };
  return map[key];
}

// ── Detail Stepper (used on individual idea pages) ────────────────────────

interface DetailStepperProps {
  id: string;
  currentStep: number;
}

function DetailStepper({ id, currentStep }: DetailStepperProps) {
  return (
    <div className="flex items-start gap-0">
      {STAGES.slice(0, 4).map((stage, idx) => {
        const completed = stage.num < currentStep;
        const active = stage.num === currentStep;

        const node = completed ? (
          <Link
            href={stageHref(id, stage.key)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        ) : active ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-semibold">
            {stage.num}
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 text-sm font-medium">
            {stage.num}
          </div>
        );

        return (
          <div key={stage.num} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              {node}
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  completed && "text-brand-600",
                  active && "text-gray-900",
                  !completed && !active && "text-gray-400"
                )}
              >
                {stage.label}
              </span>
            </div>
            {idx < STAGES.slice(0, 4).length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 mt-4",
                  stage.num < currentStep ? "bg-brand-600" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Board Pipeline (used on the main content board) ──────────────────────

interface StageCount {
  key: StageKey;
  count: number;
}

interface BoardPipelineProps {
  stages: StageCount[];
  activeStage: StageKey | "all";
  onStageClick: (stage: StageKey | "all") => void;
}

function BoardPipeline({ stages, activeStage, onStageClick }: BoardPipelineProps) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex items-center gap-0 w-full">
      {/* All */}
      <button
        onClick={() => onStageClick("all")}
        className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
          activeStage === "all"
            ? "bg-brand-50 text-brand-700"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        )}
      >
        <span className="text-[13px] font-semibold">Tất cả</span>
        <span className="text-[11px] font-medium">{total}</span>
      </button>

      <div className="w-2 text-gray-200"> </div>

      {stages.map((stage, idx) => {
        const stageDef = STAGES.find((s) => s.key === stage.key)!;
        const isActive = activeStage === stage.key;
        const isLast = idx === stages.length - 1;

        return (
          <div key={stage.key} className="flex items-center flex-1">
            <button
              onClick={() => onStageClick(stage.key)}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 py-2.5 rounded-lg transition-colors border",
                isActive
                  ? "bg-brand-50 border-brand-200 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-200"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full transition-colors",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {stageDef.icon}
              </div>
              <span className="text-[11px] font-semibold">{stageDef.label}</span>
              <span className={cn(
                "text-[11px] font-medium",
                isActive ? "text-brand-600" : "text-gray-400"
              )}>
                {stage.count}
              </span>
            </button>

            {!isLast && (
              <div className="flex items-center justify-center w-6 flex-shrink-0">
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Mini Pipeline (shown on each idea card) ──────────────────────────────

interface MiniPipelineProps {
  status: StageKey | "archived";
}

const STATUS_ORDER: StageKey[] = ["draft", "approved", "ready", "in_production", "published"];

function MiniPipeline({ status }: MiniPipelineProps) {
  if (status === "archived") {
    return (
      <div className="flex items-center gap-1">
        <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
        <span className="text-[10px] text-gray-400 font-medium ml-1">Đã lưu trữ</span>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0.5 w-full">
      {STATUS_ORDER.map((s, idx) => {
        const filled = idx <= currentIdx;
        const isFirst = idx === 0;
        const isLast = idx === STATUS_ORDER.length - 1;

        return (
          <div key={s} className="flex items-center flex-1">
            <div
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                filled ? "bg-brand-500" : "bg-gray-200",
                isFirst && "rounded-l-full",
                isLast && "rounded-r-full"
              )}
            />
            {idx < STATUS_ORDER.length - 1 && (
              <div className={cn(
                "w-0.5 h-1.5",
                idx < currentIdx ? "bg-brand-500" : "bg-gray-200"
              )} />
            )}
          </div>
        );
      })}
      <span className={cn(
        "text-[10px] font-medium ml-1.5 whitespace-nowrap",
        currentIdx === STATUS_ORDER.length - 1 ? "text-green-600" : "text-brand-600"
      )}>
        {currentIdx === STATUS_ORDER.length - 1 ? "Đã đăng" : `${currentIdx + 1}/${STATUS_ORDER.length}`}
      </span>
    </div>
  );
}

// ── Exports ──────────────────────────────────────────────────────────────

export { DetailStepper as ContentPipelineStepper, BoardPipeline, MiniPipeline };
export type { StageKey, StageDef, StageCount };
