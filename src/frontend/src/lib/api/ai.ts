import { apiClient } from "./client";

export interface AIBudgetDto {
  spentUsd: number;
  limitUsd: number;
  remainingUsd: number;
  isWarning: boolean;
}

export interface AIUsageEntryDto {
  id: string;
  provider: string;
  model: string;
  feature: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
  success: boolean;
  createdAt: string;
}

export interface AIUsageDto {
  entries: AIUsageEntryDto[];
  totalCostUsd: number;
  totalTokens: number;
}

export const aiApi = {
  budget: () =>
    apiClient
      .get<{ data: AIBudgetDto }>("/api/v1/ai/budget")
      .then((r) => r.data.data),

  usage: (page = 1, pageSize = 20) =>
    apiClient
      .get<{ data: AIUsageDto }>("/api/v1/ai/usage", { params: { page, pageSize } })
      .then((r) => r.data.data),
};
