"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "./notification-panel";

interface TopbarProps {
  title: string;
}

function getInitials(name?: string, email?: string) {
  const src = name ?? email ?? "U";
  return src.split(/[\s@]/)[0].slice(0, 2).toUpperCase();
}

export function Topbar({ title }: TopbarProps) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, clear } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clear();
    router.push("/login");
  };

  return (
    <>
      <header className="h-14 fixed top-0 left-64 right-0 z-10 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between px-8 transition-colors duration-200">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</p>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={toggle}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {/* Notification Bell */}
          <button
            className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell className="w-[18px] h-[18px]" />
            {/* Unread dot */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* Avatar + Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setAvatarOpen((v) => !v)}
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-[12px] font-semibold text-brand-700">
                {getInitials(user?.displayName, user?.email)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {avatarOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAvatarOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl bg-white dark:bg-surface-dark-secondary border border-gray-200 dark:border-gray-700/50 shadow-elevated py-1">
                  <Link
                    href="/settings/account"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setAvatarOpen(false)}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Account Settings
                  </Link>
                  <div className="my-1 h-px bg-gray-100 dark:bg-gray-700/50" />
                  <button
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    )}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
