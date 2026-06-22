"use client";

import Link from "next/link";
import { MonitorPlay, Package, Film, Bot, Download, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type JobStatus = "queued" | "processing" | "rendered" | "failed";
type RenderType = "text_to_video" | "viral_template";

interface RenderJob {
  id: string;
  product_name: string;
  template_name: string | null;
  ai_model_name: string | null;
  render_type: RenderType;
  status: JobStatus;
  char_status: JobStatus | null;
  product_status: JobStatus | null;
  queued_at: string;
  duration_seconds: number | null;
  output_url: string | null;
}

const MOCK_JOBS: RenderJob[] = [
  {
    id: "j1", product_name: "Váy Hoa Mùa Hè Premium", template_name: "Mirror Selfie Outfit Reveal",
    ai_model_name: "Luna", render_type: "viral_template", status: "rendered",
    char_status: "rendered", product_status: "rendered",
    queued_at: "2026-06-22 09:14", duration_seconds: 28, output_url: "#",
  },
  {
    id: "j2", product_name: "Đồng hồ Cơ Classic Gold", template_name: "Luxury Wrist Close-Up",
    ai_model_name: null, render_type: "viral_template", status: "processing",
    char_status: null, product_status: "processing",
    queued_at: "2026-06-22 10:02", duration_seconds: null, output_url: null,
  },
  {
    id: "j3", product_name: "Son Môi Lì Matte 24H", template_name: "Before / After Makeup",
    ai_model_name: "Ami", render_type: "viral_template", status: "processing",
    char_status: "processing", product_status: "queued",
    queued_at: "2026-06-22 10:30", duration_seconds: null, output_url: null,
  },
  {
    id: "j4", product_name: "Túi Da Thật Luxury", template_name: "Bag Drop Lifestyle",
    ai_model_name: null, render_type: "viral_template", status: "queued",
    char_status: null, product_status: "queued",
    queued_at: "2026-06-22 10:45", duration_seconds: null, output_url: null,
  },
  {
    id: "j5", product_name: "5 fitness myths debunked", template_name: null,
    ai_model_name: null, render_type: "text_to_video", status: "rendered",
    char_status: null, product_status: null,
    queued_at: "2026-06-21 18:00", duration_seconds: 45, output_url: "#",
  },
  {
    id: "j6", product_name: "Áo Khoác Bomber Unisex", template_name: "Viral Dance Product Reveal",
    ai_model_name: "Alex", render_type: "viral_template", status: "failed",
    char_status: "failed", product_status: null,
    queued_at: "2026-06-21 15:22", duration_seconds: null, output_url: null,
  },
];

const statusStyle: Record<JobStatus, { bg: string; text: string; label: string; dot: string }> = {
  queued:     { bg: "bg-gray-100",   text: "text-gray-600",   label: "Queued",     dot: "bg-gray-400" },
  processing: { bg: "bg-blue-100",   text: "text-blue-700",   label: "Processing", dot: "bg-blue-500" },
  rendered:   { bg: "bg-green-100",  text: "text-green-700",  label: "Done",       dot: "bg-green-500" },
  failed:     { bg: "bg-red-100",    text: "text-red-700",    label: "Failed",     dot: "bg-red-500" },
};

function StatusBadge({ status }: { status: JobStatus }) {
  const s = statusStyle[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", s.bg, s.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", s.dot, status === "processing" && "animate-pulse")} />
      {s.label}
    </span>
  );
}

function PipelineSteps({ job }: { job: RenderJob }) {
  if (job.render_type === "text_to_video") {
    return <span className="text-xs text-gray-400">Text → Video (TTS + FFmpeg)</span>;
  }
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {job.ai_model_name && (
        <>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1",
            job.char_status ? statusStyle[job.char_status].bg + " " + statusStyle[job.char_status].text : "bg-gray-100 text-gray-400"
          )}>
            <Bot className="w-2.5 h-2.5" />
            {job.ai_model_name}
          </span>
          <span className="text-gray-300 text-xs">→</span>
        </>
      )}
      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1",
        job.product_status ? statusStyle[job.product_status].bg + " " + statusStyle[job.product_status].text : "bg-gray-100 text-gray-400"
      )}>
        <Package className="w-2.5 h-2.5" />
        Product swap
      </span>
    </div>
  );
}

export default function JobsPage() {
  const processing = MOCK_JOBS.filter(j => j.status === "processing" || j.status === "queued").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MonitorPlay className="w-5 h-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-gray-900">Render Jobs</h1>
          </div>
          <p className="text-sm text-gray-500">Theo dõi tiến trình render video của bạn</p>
        </div>
        <Link
          href="/dashboard/studio/generate"
          className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          + Tạo video mới
        </Link>
      </div>

      {/* Active banner */}
      {processing > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-sm text-blue-700">
            <strong>{processing}</strong> job đang chạy · Tự động cập nhật mỗi 10 giây
          </p>
          <RefreshCw className="w-4 h-4 text-blue-400 ml-auto" />
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Sản phẩm / Template</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Pipeline</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Trạng thái</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Thời gian</th>
                <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_JOBS.map(job => (
                <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                        job.render_type === "viral_template" ? "bg-violet-50" : "bg-gray-100"
                      )}>
                        {job.render_type === "viral_template"
                          ? <Film className="w-3.5 h-3.5 text-violet-500" />
                          : <MonitorPlay className="w-3.5 h-3.5 text-gray-400" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-tight">{job.product_name}</p>
                        {job.template_name && (
                          <p className="text-xs text-gray-400 mt-0.5">{job.template_name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PipelineSteps job={job} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500">{job.queued_at}</p>
                      {job.duration_seconds && (
                        <p className="text-xs text-gray-400">{job.duration_seconds}s</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {job.status === "rendered" && job.output_url && (
                        <a
                          href={job.output_url}
                          className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                        >
                          <Download className="w-3 h-3" /> Tải về
                        </a>
                      )}
                      {job.status === "failed" && (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" /> Thất bại
                        </span>
                      )}
                      <Link
                        href={`/dashboard/studio/jobs/${job.id}`}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Chi tiết →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
