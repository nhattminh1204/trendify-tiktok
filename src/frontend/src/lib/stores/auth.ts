import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  rememberMe: boolean;
  status: string | null;
  hasHydrated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setRememberMe: (remember: boolean) => void;
  markTokenExpired: () => void;
  clearStatus: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      rememberMe: true,
      status: null,
      hasHydrated: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, status: null }),
      setUser: (user) => set({ user }),
      setRememberMe: (remember) => set({ rememberMe: remember }),
      markTokenExpired: () => set({ status: "token_expired" }),
      clearStatus: () => set({ status: null }),
      clear: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          status: null,
        }),
    }),
    {
      name: "trendify-auth",
      partialize: (state) =>
        state.rememberMe
          ? {
              accessToken: state.accessToken,
              refreshToken: state.refreshToken,
              user: state.user,
              rememberMe: true,
              status: state.status,
            }
          : {
              refreshToken: state.refreshToken,
              rememberMe: false,
            },
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);
