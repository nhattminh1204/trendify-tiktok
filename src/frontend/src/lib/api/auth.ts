import { apiClient } from "./client";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  workspaceId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    displayName?: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post("/api/v1/auth/login", { email, password });
    const data = res.data.data as AuthResponse;
    if (!data.user) {
      data.user = { id: data.userId, email };
    }
    return data;
  },

  register: async (
    workspaceName: string,
    email: string,
    password: string,
    niche?: string
  ): Promise<AuthResponse> => {
    const res = await apiClient.post("/api/v1/auth/register", {
      workspaceName,
      email,
      password,
      niche,
    });
    const data = res.data.data as AuthResponse;
    if (!data.user) {
      data.user = { id: data.userId, email, displayName: workspaceName };
    }
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/v1/auth/logout");
  },
};
