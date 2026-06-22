"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = getTitle(pathname ?? "");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar title={title} />
      <main className="ml-64 pt-14">
        <div className="max-w-[1280px] mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
