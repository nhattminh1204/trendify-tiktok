"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Script" },
  { num: 2, label: "Media" },
  { num: 3, label: "Caption" },
  { num: 4, label: "Publish" },
];

function stepHref(id: string, step: number): string {
  const map: Record<number, string> = {
    1: `/dashboard/content/${id}`,
    2: `/dashboard/content/${id}/media`,
    3: `/dashboard/content/${id}/caption`,
    4: `/dashboard/content/${id}/publish`,
  };
  return map[step];
}

interface ContentPipelineStepperProps {
  id: string;
  currentStep: number;
}

export function ContentPipelineStepper({ id, currentStep }: ContentPipelineStepperProps) {
  return (
    <div className="flex items-start gap-0">
      {STEPS.map((step, idx) => {
        const completed = step.num < currentStep;
        const active = step.num === currentStep;

        const node = completed ? (
          <Link
            href={stepHref(id, step.num)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        ) : active ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-semibold">
            {step.num}
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 text-sm font-medium">
            {step.num}
          </div>
        );

        return (
          <div key={step.num} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              {node}
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  completed && "text-brand-600",
                  active && "text-gray-900",
                  !completed && !active && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 mt-4",
                  step.num < currentStep ? "bg-brand-600" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
