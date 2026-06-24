import { apiClient } from "./client";

export type JobStatus = "queued" | "processing" | "rendered" | "failed" | "cancelled";

export interface VideoAssetDto {
  id: string;
  assetType: string;
  url: string;
  sortOrder: number;
}

export interface RenderJobDto {
  id: string;
  tenantId: string;
  campaignId: string | null;
  contentIdeaId: string | null;
  templateId: string;
  voiceId: string;
  ttsEngine: string;
  voiceSpeed: number | null;
  scriptText: string;
  captionText: string | null;
  hashtags: string[] | null;
  status: JobStatus;
  errorMessage: string | null;
  retryCount: number;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  assets: VideoAssetDto[];
}

export interface TemplateDto {
  id: string;
  name: string;
  videoStyle: string | null;
  compatibleProductTypes: string | null;
  hasHumanSubject: boolean;
  estimatedDurationSeconds: number | null;
  description: string | null;
  energyLevel: string | null;
  thumbnailUrl: string | null;
  productType: string | null;
}

export interface CreateRenderJobPayload {
  campaignId?: string;
  contentIdeaId?: string;
  templateId: string;
  voiceId: string;
  ttsEngine: string;
  scriptText: string;
  captionText?: string;
  hashtags?: string[];
  assetUrls?: string[];
}

export const videoApi = {
  listJobs: (params?: { status?: JobStatus; campaignId?: string; sortBy?: string; sortDir?: string }) =>
    apiClient
      .get<{ data: RenderJobDto[] }>("/api/v1/video-engine/jobs", { params })
      .then((r) => r.data.data),

  getJob: (id: string) =>
    apiClient
      .get<{ data: RenderJobDto }>(`/api/v1/video-engine/jobs/${id}`)
      .then((r) => r.data.data),

  createJob: (payload: CreateRenderJobPayload) =>
    apiClient
      .post<{ data: string }>("/api/v1/video-engine/jobs", payload)
      .then((r) => r.data.data),

  cancelJob: (id: string) =>
    apiClient
      .post<{ data: object }>(`/api/v1/video-engine/jobs/${id}/cancel`, {})
      .then((r) => r.data.data),

  listTemplates: (productType?: string) =>
    apiClient
      .get<{ data: TemplateDto[] }>("/api/v1/video-engine/templates", { params: { productType } })
      .then((r) => r.data.data),
};
