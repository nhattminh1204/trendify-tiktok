import { apiClient } from "./client";

export interface PersonaDto {
  id: string;
  name: string;
  ageRange: string;
  gender: string | null;
  primaryInterests: string[];
  painPoints: string[];
  contentPreferences: string[];
  peakActivityHours: number[];
  engagementRate: number;
  conversionRate: number;
  isPrimary: boolean;
}

export interface AudienceProfileDto {
  id: string;
  socialAccountId: string;
  totalFollowers: number;
  followersGrowth30d: number;
  engagementRate: number;
  avgViewsPerVideo: number;
  topLocations: Record<string, number>;
  topAgeGroups: Record<string, number>;
  genderSplit: Record<string, number>;
  peakEngagementHours: number[];
  personas: PersonaDto[];
  updatedAt: string;
}

export const audienceApi = {
  profile: (socialAccountId: string) =>
    apiClient
      .get<{ data: AudienceProfileDto }>("/api/v1/audience/profile", {
        params: { socialAccountId },
      })
      .then((r) => r.data.data),
};
