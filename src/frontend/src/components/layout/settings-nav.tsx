"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Link as LinkIcon,
  Zap,
  Bell,
  Building2,
  CreditCard,
  Users,
} from "lucide-react";

const settingsItems = [
  { href: "/settings/account",       label: "Account",            icon: User },
  { href: "/settings/accounts",      label: "Connected Accounts", icon: LinkIcon },
  { href: "/settings/ai-budget",     label: "AI Budget",          icon: Zap },
  { href: "/settings/notifications", label: "Notifications",      icon: Bell },
  { href: "/settings/workspace",     label: "Workspace",          icon: Building2 },
  { href: "/settings/billing",       label: "Billing",            icon: CreditCard },
  { href: "/settings/team",          label: "Team",               icon: Users },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="w-[220px] flex-shrink-0 flex flex-col gap-0.5">
      {settingsItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-100"
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
    </nav>
  );
}
