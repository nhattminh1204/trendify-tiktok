import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

type PersistedAuthState = Pick<AuthState, "refreshToken" | "user">;

const safeLocalStorage: PersistStorage<PersistedAuthState> = {
  getItem: (name) => {
    try {
      const str = localStorage.getItem(name);
      return str ? (JSON.parse(str) as { state: PersistedAuthState; version?: number }) : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // noop in SSR
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // noop in SSR
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "trendify-auth",
      storage: safeLocalStorage,
      skipHydration: true,
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
