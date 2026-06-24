"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Zap } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser, rememberMe, setRememberMe } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.googleLogin(tokenResponse.access_token);
        setTokens(res.accessToken, res.refreshToken);
        if (res.user) setUser(res.user);
        router.push("/dashboard");
      } catch {
        setError("Google login failed. Please try again.");
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google login was cancelled or failed.");
    },
    onNonOAuthError: (nonOAuthError) => {
      if (nonOAuthError.type === "popup_closed") {
        setError("Sign-in popup was closed. Please try again.");
      } else if (nonOAuthError.type === "popup_failed_to_open") {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-dark dark:to-[#0a0c14] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-lg mb-5">
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Trendify</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">AI-powered Creator Operating System</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-surface-dark-secondary border border-gray-200/80 dark:border-gray-700/50 rounded-2xl shadow-sm px-8 py-10 transition-colors duration-200">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3.5 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => loginWithGoogle()}
            loading={loading}
            className="h-12 text-[15px] font-medium border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          >
            {!loading && (
              <svg className="mr-2.5 h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {loading ? "Signing in…" : "Sign in with Google"}
          </Button>

          {/* Stay signed in */}
          <label className="flex items-center gap-2.5 mt-6 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors select-none">
              Stay signed in
            </span>
          </label>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 leading-relaxed">
            By signing in, you agree to our{" "}
            <a href="#" className="text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
