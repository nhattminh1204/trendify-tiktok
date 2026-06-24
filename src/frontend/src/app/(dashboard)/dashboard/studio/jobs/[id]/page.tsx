"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Check, Loader2, X, Package, Clock, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { videoApi, JobStatus, RenderJobDto } from "@/lib/api/video";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const statusMeta: Record<JobStatus, { label: string; variant: "default" | "info" | "success" | "danger" | "warning"; color: string }> = {
  queued:     { label: "Queued",     variant: "default", color: "bg-gray-100 text-gray-600" },
  processing: { label: "Processing", variant: "info",    color: "bg-blue-100 text-blue-700" },
  rendered:   { label: "Done",       variant: "success", color: "bg-green-100 text-green-700" },
  failed:     { label: "Failed",     variant: "danger",  color: "bg-red-100 text-red-700" },
  cancelled:  { label: "Cancelled",  variant: "warning", color: "bg-gray-100 text-gray-500" },
};

const statusOrder: JobStatus[] = ["queued", "processing", "rendered"];

function PipelineTimeline({ job }: { job: RenderJobDto }) {
  const steps = [
    { key: "queued" as const,     label: "Queued",     icon: Clock,     done: true },
    { key: "processing" as const, label: "Processing", icon: Loader2,   done: job.status !== "queued" },
    { key: "rendered" as const,   label: "Rendered",   icon: Check,     done: job.status === "rendered" },
  ];

  const currentIdx = statusOrder.indexOf(job.status === "rendered" || job.status === "failed" || job.status === "cancelled" ? "rendered" : job.status);

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentIdx;
        const isDone = step.done;
        const isFailed = job.status === "failed" && i === currentIdx;
        const isPast = i < currentIdx || (i === currentIdx && (job.status === "rendered" || job.status === "failed" || job.status === "cancelled"));

        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isFailed ? "bg-red-100" :
                isDone ? "bg-green-100" :
                isActive ? "bg-blue-100" :
                "bg-gray-100"
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  isFailed ? "text-red-600 animate-pulse" :
                  isDone ? "text-green-600" :
                  isActive ? "text-blue-600 animate-spin" :
                  "text-gray-300"
                )} />
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-0.5 h-8", isPast ? "bg-green-200" : "bg-gray-100")} />
              )}
            </div>
            <div className={cn("pb-6", i === steps.length - 1 && "pb-0")}>
              <p className={cn("text-sm font-medium", isFailed ? "text-red-700" : isDone ? "text-green-700" : isActive ? "text-blue-700" : "text-gray-400")}>
                {step.label}
              </p>
              {isActive && job.status === "processing" && (
                <p className="text-xs text-gray-500 mt-0.5">Job is being processed by the render worker…</p>
              )}
              {isFailed && job.errorMessage && (
                <div className="mt-1 text-xs text-red-600 bg-red-50 rounded-lg p-2 max-w-md">{job.errorMessage}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["render-job", id],
    queryFn: () => videoApi.getJob(id),
    refetchInterval: (q) => {
      const d = q.state.data;
      if (!d || d.status === "rendered" || d.status === "failed" || d.status === "cancelled") return false;
      return 5000;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-500">Job not found</p>
        <Link href="/dashboard/studio/jobs" className="text-sm text-brand-600 hover:underline mt-2 inline-block">← Back to jobs</Link>
      </div>
    );
  }

  const meta = statusMeta[job.status];

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard/studio/jobs" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 w-fit">
        <ChevronLeft className="w-4 h-4" /> Render Jobs
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{job.scriptText.slice(0, 80)}{job.scriptText.length > 80 ? "…" : ""}</h1>
          <p className="text-sm text-gray-500 mt-1">{job.templateId} · {job.ttsEngine} · {job.voiceId}</p>
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Render time</p>
          <p className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {job.queuedAt && job.completedAt
              ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.queuedAt).getTime()) / 1000)}s`
              : "—"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Retries</p>
          <p className="text-lg font-bold text-gray-900">{job.retryCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Assets</p>
          <p className="text-lg font-bold text-gray-900">{job.assets.length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Pipeline</h2>
        <PipelineTimeline job={job} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Script</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.scriptText}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-400">Template</dt>
              <dd className="text-gray-700">{job.templateId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">TTS Engine</dt>
              <dd className="text-gray-700">{job.ttsEngine}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Voice</dt>
              <dd className="text-gray-700">{job.voiceId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Speed</dt>
              <dd className="text-gray-700">{job.voiceSpeed ?? "1.00"}x</dd>
            </div>
            {job.captionText && (
              <div className="flex justify-between">
                <dt className="text-gray-400">Caption</dt>
                <dd className="text-gray-700 text-right max-w-[200px] truncate">{job.captionText}</dd>
              </div>
            )}
            {job.hashtags && job.hashtags.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-400">Hashtags</dt>
                <dd className="text-gray-700">{job.hashtags.length} tags</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {job.assets.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Assets</h2>
          <div className="grid grid-cols-2 gap-2">
            {job.assets.map((a) => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{a.assetType}</p>
                  <p className="text-[10px] text-gray-400 truncate">{a.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {job.status === "rendered" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Output</h2>
          <div className="w-full max-w-xs mx-auto aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex flex-col items-center justify-center gap-3 border border-gray-100">
            <Download className="w-12 h-12 text-gray-200" />
            <p className="text-xs text-gray-400">Render complete</p>
          </div>
        </div>
      )}
    </div>
  );
}
