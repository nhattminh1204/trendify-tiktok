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
  default:    "bg-gray-100 text-gray-600",
  draft:      "bg-gray-100 text-gray-600",
  archived:   "bg-gray-100 text-gray-500",
  expired:    "bg-gray-100 text-gray-500",
  viewer:     "bg-gray-100 text-gray-600",
  success:    "bg-green-100 text-green-700",
  published:  "bg-green-100 text-green-700",
  peaked:     "bg-green-100 text-green-700",
  warning:    "bg-amber-100 text-amber-700",
  declining:  "bg-amber-100 text-amber-700",
  pending:    "bg-amber-100 text-amber-700",
  danger:     "bg-red-100 text-red-700",
  info:       "bg-blue-100 text-blue-700",
  rising:     "bg-blue-100 text-blue-700",
  approved:   "bg-blue-100 text-blue-700",
  editor:     "bg-blue-100 text-blue-700",
  brand:      "bg-brand-100 text-brand-700",
  admin:      "bg-brand-100 text-brand-700",
  scheduled:  "bg-purple-100 text-purple-700",
  ai:         "bg-violet-100 text-violet-700",
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
