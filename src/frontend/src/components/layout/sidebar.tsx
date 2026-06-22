"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Lightbulb,
  BarChart3,
  GraduationCap,
  Zap,
  Settings,
  LogOut,
  Clapperboard,
  Bot,
  Film,
  MonitorPlay,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/dashboard/trends",   label: "Trends",     icon: TrendingUp },
  { href: "/dashboard/audience", label: "Audience",   icon: Users },
  { href: "/dashboard/content",  label: "Content",    icon: Lightbulb },
  { href: "/dashboard/analytics",label: "Analytics",  icon: BarChart3 },
  { href: "/dashboard/learning", label: "Learning",   icon: GraduationCap },
  { href: "/dashboard/ai",       label: "AI Engine",  icon: Zap },
];

const studioItems = [
  { href: "/dashboard/studio/generate", label: "Create Video", icon: Clapperboard },
  { href: "/dashboard/studio/models",   label: "AI Models",    icon: Bot },
  { href: "/dashboard/studio/templates",label: "Templates",    icon: Film },
  { href: "/dashboard/studio/jobs",     label: "Render Jobs",  icon: MonitorPlay },
];

function getInitials(name?: string, email?: string) {
  const src = name ?? email ?? "U";
  return src
    .split(/[\s@]/)[0]
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuthStore();

  const handleLogout = () => {
    clear();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col bg-white border-r border-gray-200 z-20">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[20px] font-bold text-gray-900 leading-none">Trendify</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Creator OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn("w-4 h-4 flex-shrink-0", active ? "text-brand-600" : "text-gray-400")}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          );
        })}

        <div className="my-2 mx-3 h-px bg-gray-100" />

        <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Studio
        </p>

        {studioItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn("w-4 h-4 flex-shrink-0", active ? "text-brand-600" : "text-gray-400")}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          );
        })}

        <div className="my-2 mx-3 h-px bg-gray-100" />

        <Link
          href="/settings/account"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
            pathname.startsWith("/settings")
              ? "bg-brand-50 text-brand-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <Settings
            className={cn(
              "w-4 h-4 flex-shrink-0",
              pathname.startsWith("/settings") ? "text-brand-600" : "text-gray-400"
            )}
            strokeWidth={1.75}
          />
          Settings
        </Link>
      </nav>

      {/* User block */}
      <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-[12px] font-semibold text-brand-700 flex-shrink-0">
          {getInitials(user?.displayName, user?.email)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.displayName ?? "Creator"}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
