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

export interface WatchlistItemDto {
  id: string;
  trendDetectionId: string;
  keyword: string;
  niche: string;
  score: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface CompetitorDto {
  id: string;
  tiktokUsername: string;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  notes: string | null;
  lastScannedAt: string | null;
  createdAt: string;
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

  getWatchlist: () =>
    apiClient
      .get<{ data: WatchlistItemDto[] }>("/api/v1/trends/watchlist")
      .then((r) => r.data.data),

  addToWatchlist: (trendDetectionId: string) =>
    apiClient
      .post(`/api/v1/trends/${trendDetectionId}/watch`)
      .then((r) => r.data),

  removeFromWatchlist: (trendDetectionId: string) =>
    apiClient
      .delete(`/api/v1/trends/${trendDetectionId}/watch`)
      .then((r) => r.data),

  updateWatchlistNote: (trendDetectionId: string, notes: string | null) =>
    apiClient
      .patch(`/api/v1/trends/${trendDetectionId}/watch/notes`, { notes })
      .then((r) => r.data),

  getCompetitors: () =>
    apiClient
      .get<{ data: CompetitorDto[] }>("/api/v1/trends/competitors")
      .then((r) => r.data.data),

  addCompetitor: (tiktokUsername: string, notes?: string | null) =>
    apiClient
      .post("/api/v1/trends/competitors", { tiktokUsername, notes })
      .then((r) => r.data),

  removeCompetitor: (competitorId: string) =>
    apiClient
      .delete(`/api/v1/trends/competitors/${competitorId}`)
      .then((r) => r.data),
};
