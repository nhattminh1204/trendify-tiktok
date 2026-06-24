"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type State = "processing" | "success" | "error";

function TikTokCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("processing");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setState("error");
      return;
    }

    const timer = setTimeout(() => setState("success"), 1500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    if (state !== "success") return;
    if (countdown <= 0) {
      router.push("/settings/accounts");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [state, countdown, router]);

  return (
    <div className="max-w-[400px] w-full text-center">
      {state === "processing" && (
        <>
          <div className="w-12 h-12 mx-auto border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mt-5">
            Connecting your TikTok account…
          </h2>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </>
      )}

      {state === "success" && (
        <>
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">TikTok connected!</h2>
          <p className="text-sm text-gray-600 mt-2">
            @creator has been linked to your workspace.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Redirecting in {countdown}s…
          </p>
          <Button onClick={() => router.push("/settings/accounts")} className="mt-5">
            Go to Dashboard
          </Button>
        </>
      )}

      {state === "error" && (
        <>
          <XCircle className="w-14 h-14 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Connection failed</h2>
          <p className="text-sm text-gray-600 mt-2">
            We couldn't connect your TikTok account. Please try again.
          </p>
          <Button onClick={() => router.push("/onboarding")} className="mt-6">
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </Button>
          <button
            onClick={() => router.push("/settings/accounts")}
            className="block mx-auto mt-2 text-sm text-brand-600 hover:underline"
          >
            Back to settings
          </button>
        </>
      )}
    </div>
  );
}

export default function TikTokCallbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Suspense fallback={<div className="w-12 h-12 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />}>
        <TikTokCallbackContent />
      </Suspense>
    </div>
  );
}
