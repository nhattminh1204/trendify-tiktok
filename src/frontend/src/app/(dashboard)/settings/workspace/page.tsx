"use client";

import { useState } from "react";
import { Building2, Globe, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

const NICHES = [
  "Fitness",
  "Cooking",
  "Tech",
  "Beauty",
  "Finance",
  "Education",
  "Entertainment",
  "Gaming",
];

const TIMEZONES = [
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho Chi Minh (UTC+7)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" },
  { value: "America/New_York", label: "America/New York (UTC-5)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (UTC-8)" },
  { value: "Europe/London", label: "Europe/London (UTC+0)" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1)" },
  { value: "UTC", label: "UTC (UTC+0)" },
];

export default function WorkspacePage() {
  const [name, setName] = useState("My Creator Brand");
  const [slug, setSlug] = useState("my-creator-brand");
  const [niche, setNiche] = useState("Fitness");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your workspace identity and regional preferences.
        </p>
      </div>

      {/* Identity Card */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-brand-600" />
          <h2 className="text-base font-semibold text-gray-900">
            Workspace Identity
          </h2>
        </div>

        {/* Workspace logo */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-xl font-bold shrink-0">
            MC
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="secondary" size="sm">
              Upload logo
            </Button>
            <p className="text-[11px] text-gray-400">
              PNG or SVG · recommended 128×128px
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Workspace name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
              );
            }}
            placeholder="My Creator Brand"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Workspace URL
            </label>
            <div className="flex items-center h-9 rounded-lg border border-gray-300 overflow-hidden focus-within:border-brand-500 focus-within:ring-[3px] focus-within:ring-brand-500/20 transition-all">
              <span className="px-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-300 h-full flex items-center shrink-0">
                trendify.app/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-3 text-sm text-gray-900 bg-white focus:outline-none h-full"
              />
            </div>
            <p className="text-xs text-gray-400">
              Used for sharing and direct links.
            </p>
          </div>
        </div>
      </Card>

      {/* Content Preferences Card */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-brand-600" />
          <h2 className="text-base font-semibold text-gray-900">
            Content Preferences
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <Select
            label="Primary niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          >
            {NICHES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>

          <p className="text-xs text-gray-400 -mt-2">
            Used to personalize trend recommendations and AI suggestions.
          </p>
        </div>
      </Card>

      {/* Regional Settings Card */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-brand-600" />
          <h2 className="text-base font-semibold text-gray-900">
            Regional Settings
          </h2>
        </div>

        <Select
          label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </Select>

        <p className="text-xs text-gray-400 mt-1.5">
          Used for scheduling, analytics, and quiet hours.
        </p>
      </Card>

      {/* Save row */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave}>
          {saved ? "Saved ✓" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
