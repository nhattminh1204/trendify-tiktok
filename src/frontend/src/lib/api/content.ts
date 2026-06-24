import { apiClient } from "./client";

export type IdeaStatus = "draft" | "approved" | "ready" | "in_production" | "scheduled" | "published" | "archived";

export interface IdeaDto {
  id: string;
  title: string;
  hook: string | null;
  description: string | null;
  niche: string;
  targetAudience: string | null;
  estimatedViews: number | null;
  status: IdeaStatus;
  aiGenerated: boolean;
  createdAt: string;
}

export const contentApi = {
  list: (status?: IdeaStatus) =>
    apiClient
      .get<{ data: IdeaDto[] }>("/api/v1/content/ideas", { params: { status } })
      .then((r) => r.data.data),

  create: (payload: { title: string; niche: string; hook?: string; description?: string }) =>
    apiClient
      .post<{ data: IdeaDto }>("/api/v1/content/ideas", payload)
      .then((r) => r.data.data),

  approve: (id: string) =>
    apiClient
      .post<{ data: IdeaDto }>(`/api/v1/content/ideas/${id}/approve`, {})
      .then((r) => r.data.data),

  publish: (id: string, publishedUrl: string) =>
    apiClient
      .post<{ data: IdeaDto }>(`/api/v1/content/ideas/${id}/publish`, { publishedUrl })
      .then((r) => r.data.data),
};
