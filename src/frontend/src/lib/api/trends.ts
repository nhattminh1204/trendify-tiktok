import { apiClient } from "./client";

export interface TrendDto {
  id: string;
  keyword: string;
  niche: string;
  platform: string;
  score: number;
  velocityScore: number;
  volumeScore: number;
  engagementScore: number;
  status: "rising" | "peaked" | "declining" | "expired";
  detectedAt: string;
  expiresAt: string | null;
}

export interface TrendDetailDto extends TrendDto {
  rawData: Record<string, unknown> | null;
}

export const trendsApi = {
  list: (niche?: string) =>
    apiClient
      .get<{ data: TrendDto[] }>("/api/v1/trends", { params: { niche } })
      .then((r) => r.data.data),

  detail: (id: string) =>
    apiClient
      .get<{ data: TrendDetailDto }>(`/api/v1/trends/${id}`)
      .then((r) => r.data.data),
};
