"use client";

import { AlertTriangle, X } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useRouter } from "next/navigation";

export function TokenExpiredBanner() {
  const { status, clear } = useAuthStore();
  const router = useRouter();

  if (status !== "token_expired") return null;

  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl px-5 py-3.5 mb-6">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
      <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">
        Your session has expired. Please sign in again to continue.
      </p>
      <button
        onClick={() => {
          clear();
          router.push("/login");
        }}
        className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2"
      >
        Sign in
      </button>
      <button
        onClick={() => useAuthStore.getState().clearStatus()}
        className="text-amber-400 hover:text-amber-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
