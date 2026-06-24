import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand"
  | "rising"
  | "peaked"
  | "declining"
  | "expired"
  | "scheduled"
  | "ai"
  | "draft"
  | "approved"
  | "ready"
  | "in_production"
  | "published"
  | "archived"
  | "admin"
  | "editor"
  | "viewer"
  | "pending";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  draft:      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  archived:   "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  expired:    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  viewer:     "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  success:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  published:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_production: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ready:      "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  peaked:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  declining:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info:       "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  rising:     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  approved:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  editor:     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  brand:      "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
  admin:      "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
  scheduled:  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ai:         "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
