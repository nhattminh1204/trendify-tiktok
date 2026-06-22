"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ProgressBar } from "@/components/ui/progress";

interface Provider {
  id: string;
  name: string;
  role: "Primary" | "Fallback 1" | "Fallback 2";
  enabled: boolean;
}

interface AutoPauseToggles {
  pauseAt100: boolean;
  emailAt80: boolean;
}

const INITIAL_PROVIDERS: Provider[] = [
  { id: "openai", name: "OpenAI", role: "Primary", enabled: true },
  { id: "anthropic", name: "Anthropic", role: "Fallback 1", enabled: false },
  { id: "gemini", name: "Gemini", role: "Fallback 2", enabled: false },
];

const ROLE_BADGE: Record<Provider["role"], "brand" | "default"> = {
  Primary: "brand",
  "Fallback 1": "default",
  "Fallback 2": "default",
};

const USED_DOLLARS = 12.5;
const LIMIT_DEFAULT = 50;
const USAGE_PCT = (USED_DOLLARS / LIMIT_DEFAULT) * 100;

export default function AIBudgetPage() {
  const [limitValue, setLimitValue] = useState<string>(
    String(LIMIT_DEFAULT)
  );
  const [toggles, setToggles] = useState<AutoPauseToggles>({
    pauseAt100: true,
    emailAt80: true,
  });
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);

  function handleProviderToggle(id: string, value: boolean) {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: value } : p))
    );
  }

  function handleAutoPauseToggle(key: keyof AutoPauseToggles) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const remaining = Math.max(
    0,
    Number(limitValue || LIMIT_DEFAULT) - USED_DOLLARS
  );

  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Budget</h1>
        <p className="text-sm text-gray-500 mt-1">
          Control your monthly AI spending and provider preferences.
        </p>
      </div>

      {/* Current Usage Card */}
      <Card padding="md">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            June 2026 Usage
          </span>
          <span className="text-sm font-bold text-gray-900">
            ${USED_DOLLARS.toFixed(2)} / ${Number(limitValue || LIMIT_DEFAULT).toFixed(2)}
          </span>
        </div>
        <ProgressBar value={USAGE_PCT} size="md" />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">
            {USAGE_PCT.toFixed(1)}% used
          </span>
          <span className="text-xs text-gray-400">
            ${remaining.toFixed(2)} remaining
          </span>
        </div>
      </Card>

      {/* Budget Limit Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900">
          Monthly spending limit
        </h2>
        <p className="text-[13px] text-gray-500 mt-1 mb-4">
          Set a monthly cap to prevent unexpected charges.
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Spending limit
          </label>
          <div className="flex items-center h-9 rounded-lg border border-gray-300 bg-white focus-within:border-brand-500 focus-within:shadow-focused transition-colors duration-150 overflow-hidden">
            <span className="px-3 text-sm text-gray-500 border-r border-gray-200 h-full flex items-center bg-gray-50">
              $
            </span>
            <input
              type="number"
              min={0}
              value={limitValue}
              onChange={(e) => setLimitValue(e.target.value)}
              className="flex-1 h-full px-3 text-sm text-gray-900 bg-white focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <Button variant="primary">Save limit</Button>
        </div>
      </Card>

      {/* Provider Priority Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900">
          Provider Priority
        </h2>
        <p className="text-[13px] text-gray-500 mt-1 mb-4">
          Drag to reorder preference
        </p>
        <div className="flex flex-col gap-2">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5"
            >
              <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
              <span className="text-sm font-medium text-gray-900 flex-1">
                {provider.name}
              </span>
              <Badge variant={ROLE_BADGE[provider.role]}>{provider.role}</Badge>
              <Toggle
                checked={provider.enabled}
                onChange={(val) => handleProviderToggle(provider.id, val)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Auto-pause Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Alerts & Auto-pause
        </h2>
        <div className="flex flex-col divide-y divide-gray-50">
          <div className="flex justify-between items-center py-3.5">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Pause AI at 100% budget
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Stop all AI operations when your monthly limit is reached.
              </p>
            </div>
            <Toggle
              checked={toggles.pauseAt100}
              onChange={() => handleAutoPauseToggle("pauseAt100")}
            />
          </div>
          <div className="flex justify-between items-center py-3.5">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Email alert at 80%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Receive an email when you reach 80% of your spending limit.
              </p>
            </div>
            <Toggle
              checked={toggles.emailAt80}
              onChange={() => handleAutoPauseToggle("emailAt80")}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
