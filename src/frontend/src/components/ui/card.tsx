import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type CardVariant = "default" | "interactive" | "highlight" | "warning" | "danger";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg";
}

const variantClasses: Record<CardVariant, string> = {
  default:     "bg-white border border-gray-200 dark:bg-surface-dark-secondary dark:border-gray-700/50",
  interactive: "bg-white border border-gray-200 dark:bg-surface-dark-secondary dark:border-gray-700/50 hover:border-brand-400 dark:hover:border-brand-500 cursor-pointer transition-colors duration-150",
  highlight:   "bg-violet-50 border border-violet-200 dark:bg-violet-900/20 dark:border-violet-800/30",
  warning:     "bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30",
  danger:      "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/30",
};

const paddingClasses = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl shadow-card",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
