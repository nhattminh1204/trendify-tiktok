"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/lib/stores/auth";
import { TokenExpiredBanner } from "@/components/token-expired-banner";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/trends": "Trend Intelligence",
  "/dashboard/audience": "Audience Intelligence",
  "/dashboard/content": "Content Ideas",
  "/dashboard/content/calendar": "Content Calendar",
  "/dashboard/content/generate": "AI Script Generator",
  "/dashboard/analytics": "Analytics",
  "/dashboard/learning": "Learning Engine",
  "/dashboard/ai": "AI Engine",
  "/dashboard/studio/generate": "Create Video",
  "/dashboard/studio/models": "AI Model Library",
  "/dashboard/studio/models/upload": "Upload AI Model",
  "/dashboard/studio/templates": "Viral Templates",
  "/dashboard/studio/jobs": "Render Jobs",
};

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/dashboard/trends/")) return "Trend Detail";
  if (pathname.startsWith("/dashboard/content/")) return "Content Idea";
  if (pathname.startsWith("/dashboard/studio/jobs/")) return "Render Job Detail";
  if (pathname.startsWith("/dashboard/studio/")) return "Studio";
  if (pathname.startsWith("/settings/")) {
    const sub = pathname.replace("/settings/", "");
    const map: Record<string, string> = {
      account: "Account",
      accounts: "Connected Accounts",
      "ai-budget": "AI Budget",
      notifications: "Notifications",
      billing: "Billing",
      team: "Team",
      workspace: "Workspace",
    };
    return map[sub] ?? "Settings";
  }
  return "Trendify";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken, refreshToken } = useAuthStore();
  const title = useMemo(() => getTitle(pathname ?? ""), [pathname]);

  useEffect(() => {
    if (!accessToken && !refreshToken) {
      router.replace("/login");
    }
  }, [accessToken, refreshToken, router]);

  return (
    <>
      <Topbar title={title} />
      <main className="ml-64 pt-14">
        <div className="max-w-[1280px] mx-auto p-8">
          <TokenExpiredBanner />
          {children}
        </div>
      </main>
    </>
  );
}
