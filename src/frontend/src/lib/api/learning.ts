import { apiClient } from "./client";

export interface ContentPatternDto {
  id: string;
  name: string;
  category: string;
  description: string | null;
  avgEngagementRate: number;
  sampleSize: number;
  confidence: number;
}

export interface RecommendationDto {
  id: string;
  title: string;
  description: string;
  category: string;
  expectedImpactPercent: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "applied" | "dismissed";
  createdAt: string;
}

export const learningApi = {
  patterns: () =>
    apiClient
      .get<{ data: ContentPatternDto[] }>("/api/v1/learning/patterns")
      .then((r) => r.data.data),

  recommendations: () =>
    apiClient
      .get<{ data: RecommendationDto[] }>("/api/v1/learning/recommendations")
      .then((r) => r.data.data),

  applyRecommendation: (id: string) =>
    apiClient
      .post<{ data: RecommendationDto }>(`/api/v1/learning/recommendations/${id}/apply`, {})
      .then((r) => r.data.data),

  dismissRecommendation: (id: string, reason?: string) =>
    apiClient
      .post<{ data: RecommendationDto }>(`/api/v1/learning/recommendations/${id}/dismiss`, {
        reason,
      })
      .then((r) => r.data.data),
};
