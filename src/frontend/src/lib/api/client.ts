import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/lib/stores/auth";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

let pendingRefresh: Promise<boolean> | null = null;

function getPendingRefresh(): Promise<boolean> {
  if (!pendingRefresh) {
    pendingRefresh = doRefresh().finally(() => {
      pendingRefresh = null;
    });
  }
  return pendingRefresh;
}

export async function refreshTokens(): Promise<boolean> {
  return getPendingRefresh();
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return false;

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
      { refreshToken }
    );
    const { accessToken, refreshToken: newRefresh } = res.data.data;
    useAuthStore.getState().setTokens(accessToken, newRefresh);
    return true;
  } catch {
    useAuthStore.getState().markTokenExpired();
    return false;
  }
}

// Inject access token on every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401 with retry (up to 3 times) and request queue
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & {
      _retryCount?: number;
    };

    if (error.response?.status === 401 && (original._retryCount ?? 0) < 3) {
      original._retryCount = (original._retryCount ?? 0) + 1;

      const ok = await getPendingRefresh();
      if (!ok) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      const newToken = useAuthStore.getState().accessToken;
      if (original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
      }
      return apiClient(original);
    }

    return Promise.reject(error);
  }
);
