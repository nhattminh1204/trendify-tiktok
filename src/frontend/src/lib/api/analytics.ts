import { apiClient } from "./client";

export interface MetricsDto {
  socialAccountId: string;
  period: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowersGained: number;
  avgEngagementRate: number;
  bestPostingHour: number | null;
  bestPostingDay: number | null;
  topPerformingVideoId: string | null;
}

export const analyticsApi = {
  metrics: (socialAccountId: string, period: "7d" | "30d" | "90d" = "30d") =>
    apiClient
      .get<{ data: MetricsDto }>("/api/v1/analytics/metrics", {
        params: { socialAccountId, period },
      })
      .then((r) => r.data.data),
};
