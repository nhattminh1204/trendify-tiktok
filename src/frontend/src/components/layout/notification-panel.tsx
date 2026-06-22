"use client";

import { useState } from "react";
import { X, Bell, TrendingUp, Zap, DollarSign, Lightbulb, Info, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

type NotifType = "trend" | "ai" | "budget" | "recommendation" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  action?: { label: string; href: string };
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "trend", title: "#fitnessmotivation is rising", body: "Score jumped from 74 to 91 in the last 2 hours. High opportunity window.", timestamp: "2 min ago", read: false, action: { label: "View trend", href: "/dashboard/trends/1" } },
  { id: "2", type: "ai", title: "Script generated", body: "Your AI script for '5 fitness myths' is ready to review.", timestamp: "15 min ago", read: false, action: { label: "View script", href: "/dashboard/content/1" } },
  { id: "3", type: "budget", title: "Budget at 80%", body: "You've used $40 of your $50 monthly AI budget.", timestamp: "1 hr ago", read: false, action: { label: "Manage budget", href: "/settings/ai-budget" } },
  { id: "4", type: "recommendation", title: "New recommendation", body: "Post Thursday 7pm for 23% higher engagement on fitness content.", timestamp: "3 hr ago", read: true },
  { id: "5", type: "system", title: "TikTok data synced", body: "Your audience and analytics data has been refreshed.", timestamp: "1 day ago", read: true },
];

const TABS = ["All", "Unread", "Trends", "AI", "System"] as const;

type Tab = typeof TABS[number];

const typeConfig: Record<NotifType, { icon: typeof TrendingUp; bg: string; iconClass: string }> = {
  trend:          { icon: TrendingUp, bg: "bg-blue-50",   iconClass: "text-blue-500" },
  ai:             { icon: Zap,        bg: "bg-violet-50", iconClass: "text-violet-500" },
  budget:         { icon: DollarSign, bg: "bg-amber-50",  iconClass: "text-amber-500" },
  recommendation: { icon: Lightbulb,  bg: "bg-amber-50",  iconClass: "text-amber-500" },
  system:         { icon: Info,        bg: "bg-gray-100",  iconClass: "text-gray-400" },
};

function tabFilter(tab: Tab, n: Notification): boolean {
  if (tab === "All") return true;
  if (tab === "Unread") return !n.read;
  if (tab === "Trends") return n.type === "trend";
  if (tab === "AI") return n.type === "ai";
  if (tab === "System") return n.type === "system";
  return true;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [tab, setTab] = useState<Tab>("All");
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const filtered = notifications.filter((n) => tabFilter(tab, n));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-40 w-[400px] bg-white shadow-elevated flex flex-col rounded-l-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[13px] text-brand-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-100 px-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-2 text-[13px] font-medium transition-colors",
                tab === t
                  ? "border-b-2 border-brand-600 text-brand-700"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <BellOff className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No {tab !== "All" ? tab.toLowerCase() + " " : ""}notifications yet.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const { icon: Icon, bg, iconClass } = typeConfig[n.type];
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors",
                    !n.read && "border-l-[3px] border-l-brand-500 bg-brand-50/30"
                  )}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((item) =>
                        item.id === n.id ? { ...item, read: true } : item
                      )
                    );
                  }}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                      bg
                    )}
                  >
                    <Icon className={cn("w-[18px] h-[18px]", iconClass)} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm text-gray-900", !n.read && "font-medium")}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">{n.timestamp}</span>
                    </div>
                    <p className="text-[13px] text-gray-600 mt-0.5 line-clamp-2">{n.body}</p>
                    {n.action && (
                      <a
                        href={n.action.href}
                        className="text-[12px] text-brand-600 hover:underline mt-1 inline-block"
                      >
                        {n.action.label}
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
