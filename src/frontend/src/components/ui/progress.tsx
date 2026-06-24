import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({ value, max = 100, size = "sm", className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillColor =
    pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-brand-500";

  return (
    <div
      className={cn("w-full rounded-full bg-gray-100 dark:bg-gray-800", sizeClasses[size], className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("rounded-full transition-all duration-300", sizeClasses[size], fillColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
