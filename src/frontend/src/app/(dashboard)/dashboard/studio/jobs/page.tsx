"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  MonitorPlay, Package, Film, Bot, Download, RefreshCw,
  AlertCircle, SearchX, Plus, X, Loader2, Clock, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { videoApi, RenderJobDto, JobStatus } from "@/lib/api/video";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const statusMap: Record<JobStatus, { label: string; variant: "default" | "info" | "success" | "danger" | "warning" }> = {
  queued:     { label: "Queued",     variant: "default" },
  processing: { label: "Processing", variant: "info" },
  rendered:   { label: "Done",       variant: "success" },
  failed:     { label: "Failed",     variant: "danger" },
  cancelled:  { label: "Cancelled",  variant: "warning" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function CreateJobModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [scriptText, setScriptText] = useState("");
  const [templateId, setTemplateId] = useState("product-review-v1");
  const [voiceId, setVoiceId] = useState("vi-VN-HoaiMyNeural");
  const [ttsEngine, setTtsEngine] = useState("edge");
  const [captionText, setCaptionText] = useState("");
  const [error, setError] = useState("");

  const { data: templates } = useQuery({
    queryKey: ["video-templates"],
    queryFn: () => videoApi.listTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: () => videoApi.createJob({
      templateId, voiceId, ttsEngine, scriptText,
      captionText: captionText || undefined,
    }),
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["render-jobs"] });
      toast("success", `Render job created (${id.slice(0, 8)}…)`);
      onClose();
      setScriptText("");
      setCaptionText("");
      setError("");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Failed to create job");
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Create render job" maxWidth="max-w-[560px]">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Script</label>
          <Textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="Enter video script text…"
            rows={5}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Template" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {(templates ?? []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <Select label="TTS Engine" value={ttsEngine} onChange={(e) => setTtsEngine(e.target.value)}>
            <option value="edge">Edge TTS</option>
            <option value="openai">OpenAI TTS</option>
            <option value="omnivoice">OmniVoice VI</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Voice ID" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} placeholder="vi-VN-HoaiMyNeural" />
          <Input label="Caption (optional)" value={captionText} onChange={(e) => setCaptionText(e.target.value)} placeholder="On-screen caption" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => createMutation.mutate()}
          loading={createMutation.isPending}
          disabled={!scriptText.trim()}
        >
          Create job
        </Button>
      </div>
    </Modal>
  );
}

export default function JobsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const qc = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["render-jobs"],
    queryFn: () => videoApi.listJobs({ sortBy: "queuedAt", sortDir: "desc" }),
    refetchInterval: 10_000,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => videoApi.cancelJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["render-jobs"] }),
  });

  const processingCount = (jobs ?? []).filter(j => j.status === "processing" || j.status === "queued").length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MonitorPlay className="w-5 h-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-gray-900">Render Jobs</h1>
          </div>
          <p className="text-sm text-gray-500">Track video render progress</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New job
        </Button>
      </div>

      {processingCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-sm text-blue-700">
            <strong>{processingCount}</strong> job{processingCount > 1 ? "s" : ""} running · auto-refresh every 10s
          </p>
          <RefreshCw className="w-4 h-4 text-blue-400 ml-auto" />
        </div>
      )}

      {isLoading ? (
        <Card>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </Card>
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No render jobs yet"
          subtitle="Create your first video render job to get started."
          action={{ label: "New job", onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Script</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Template</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Queued</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const s = statusMap[job.status];
                  return (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2 max-w-[300px]">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MonitorPlay className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 leading-tight truncate">{job.scriptText.slice(0, 60)}{job.scriptText.length > 60 ? "…" : ""}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{job.ttsEngine} · {job.voiceId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{job.templateId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">{formatDate(job.queuedAt)}</p>
                        {job.retryCount > 0 && (
                          <p className="text-xs text-amber-500">Retry #{job.retryCount}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.status === "queued" && (
                            <button
                              onClick={() => cancelMutation.mutate(job.id)}
                              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          )}
                          {job.status === "rendered" && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <Download className="w-3 h-3" /> Done
                            </span>
                          )}
                          {job.status === "failed" && job.errorMessage && (
                            <span className="flex items-center gap-1 text-xs text-red-500" title={job.errorMessage}>
                              <AlertCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                          <Link
                            href={`/dashboard/studio/jobs/${job.id}`}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Detail →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateJobModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
