"use client";

import Link from "next/link";
import { ChevronLeft, Check, Loader2, X, Package, Bot, Film, Video, Download, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock job detail
const MOCK_JOB = {
  id: "j1",
  render_type: "viral_template",
  product: { name: "Váy Hoa Mùa Hè Premium", category: "Váy & Đầm", product_type: "fashion_female" },
  template: { name: "Mirror Selfie Outfit Reveal", video_style: "mirror_selfie", estimated_duration_seconds: 28 },
  ai_model: { display_name: "Luna", gender: "female", style: "luxury" },
  status: "rendered",
  steps: {
    character_replacement: {
      status: "complete",
      provider: "kling_api",
      processing_duration_ms: 47200,
      cost_usd: 0.75,
    },
    product_replacement: {
      status: "complete",
      detection_provider: "grounding_dino_replicate",
      segmentation_provider: "sam2_replicate",
      inpainting_provider: "stability_inpaint",
      detected_frames_count: 62,
      total_sampled_frames: 112,
      processing_duration_ms: 23100,
      cost_usd: 0.07,
    },
    post_processing: {
      status: "complete",
      duration_seconds: 28,
      processing_duration_ms: 8400,
      cost_usd: 0,
    },
  },
  output_url: "#",
  thumbnail_url: null,
  queued_at: "2026-06-22 09:14",
  completed_at: "2026-06-22 09:28",
};

type StepStatus = "complete" | "processing" | "queued" | "failed" | "skipped";

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "complete") return (
    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
      <Check className="w-4 h-4 text-green-600" />
    </div>
  );
  if (status === "processing") return (
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
    </div>
  );
  if (status === "failed") return (
    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
      <X className="w-4 h-4 text-red-600" />
    </div>
  );
  if (status === "skipped") return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400 text-xs font-bold">—</span>
    </div>
  );
  // queued
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-gray-300" />
    </div>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function JobDetailPage() {
  const job = MOCK_JOB;
  const totalCost = (
    (job.steps.character_replacement.cost_usd || 0) +
    (job.steps.product_replacement.cost_usd || 0)
  ).toFixed(4);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/studio/jobs" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 w-fit">
        <ChevronLeft className="w-4 h-4" /> Render Jobs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{job.product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{job.template.name} · {job.template.video_style}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-700">
            <Check className="w-3.5 h-3.5" /> Hoàn thành
          </span>
          {job.output_url && (
            <a
              href={job.output_url}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Tải video
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Thời gian render</p>
          <p className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {job.queued_at && job.completed_at ? "14m" : "—"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Độ dài video</p>
          <p className="text-xl font-bold text-gray-900">{job.steps.post_processing.duration_seconds}s</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Chi phí AI</p>
          <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-400" />{totalCost}
          </p>
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Pipeline Execution</h2>
        </div>

        {/* Step 1: Character Replacement */}
        <div className="px-5 py-5 border-b border-gray-50">
          <div className="flex items-start gap-3">
            <StepIcon status={job.steps.character_replacement.status as StepStatus} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-semibold text-gray-900">Character Replacement</span>
                </div>
                <span className="text-xs text-gray-400">{formatMs(job.steps.character_replacement.processing_duration_ms)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                AI Model <strong>{job.ai_model.display_name}</strong> đã thay thế nhân vật gốc trong template.
              </p>
              <div className="flex gap-4 mt-2">
                <div className="text-xs text-gray-400">Provider: <span className="font-medium text-gray-600">{job.steps.character_replacement.provider}</span></div>
                <div className="text-xs text-gray-400">Cost: <span className="font-medium text-gray-600">${job.steps.character_replacement.cost_usd}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex items-center gap-3 px-5 py-1.5">
          <div className="w-8 flex justify-center">
            <div className="w-0.5 h-4 bg-gray-100" />
          </div>
        </div>

        {/* Step 2: Product Replacement */}
        <div className="px-5 py-5 border-b border-gray-50">
          <div className="flex items-start gap-3">
            <StepIcon status={job.steps.product_replacement.status as StepStatus} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-900">Product Replacement</span>
                </div>
                <span className="text-xs text-gray-400">{formatMs(job.steps.product_replacement.processing_duration_ms)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sản phẩm gốc đã được thay thế bằng <strong>{job.product.name}</strong>.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-2.5">
                <div className="bg-gray-50 rounded-lg p-2.5 text-xs">
                  <p className="text-gray-400 mb-0.5">Detection</p>
                  <p className="font-medium text-gray-700 text-[11px]">{job.steps.product_replacement.detection_provider}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-xs">
                  <p className="text-gray-400 mb-0.5">Segmentation</p>
                  <p className="font-medium text-gray-700 text-[11px]">{job.steps.product_replacement.segmentation_provider}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-xs">
                  <p className="text-gray-400 mb-0.5">Inpainting</p>
                  <p className="font-medium text-gray-700 text-[11px]">{job.steps.product_replacement.inpainting_provider}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="text-xs text-gray-400">
                  Detected: <span className="font-medium text-gray-600">{job.steps.product_replacement.detected_frames_count}/{job.steps.product_replacement.total_sampled_frames} frames</span>
                </div>
                <div className="text-xs text-gray-400">Cost: <span className="font-medium text-gray-600">${job.steps.product_replacement.cost_usd}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex items-center gap-3 px-5 py-1.5">
          <div className="w-8 flex justify-center">
            <div className="w-0.5 h-4 bg-gray-100" />
          </div>
        </div>

        {/* Step 3: Post-processing */}
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <StepIcon status={job.steps.post_processing.status as StepStatus} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-900">Post-Processing</span>
                </div>
                <span className="text-xs text-gray-400">{formatMs(job.steps.post_processing.processing_duration_ms)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                FFmpeg encode final · {job.steps.post_processing.duration_seconds}s · 1080×1920 H.264 + AAC
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video preview area */}
      {job.status === "rendered" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Video Output</h2>
          <div className="w-full max-w-xs mx-auto aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex flex-col items-center justify-center gap-3 border border-gray-100">
            <Film className="w-12 h-12 text-gray-200" />
            <p className="text-xs text-gray-400">{job.steps.post_processing.duration_seconds}s · 1080×1920</p>
          </div>
          <div className="flex justify-center mt-4">
            <a
              href={job.output_url ?? "#"}
              className="flex items-center gap-2 px-6 h-10 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Tải video (.mp4)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
