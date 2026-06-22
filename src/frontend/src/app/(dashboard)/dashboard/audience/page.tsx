"use client";

import { useState } from "react";
import { Users, AlertCircle } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  Skeleton,
  SkeletonCard,
} from "@/components/ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AudienceStats {
  totalFollowers: number;
  growth30d: number;
  engagementRate: number;
  avgViewsPerVideo: number;
}

interface Persona {
  id: string;
  name: string;
  ageSex: string;
  engagement: number;
  isPrimary: boolean;
  interests: string[];
}

interface Location {
  country: string;
  pct: number;
}

interface AgeGroup {
  label: string;
  pct: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_STATS: AudienceStats = {
  totalFollowers:   124_500,
  growth30d:          2_340,
  engagementRate:      4.82,
  avgViewsPerVideo:   18_200,
};

const MOCK_PERSONAS: Persona[] = [
  {
    id: "1",
    name: "Fitness Enthusiasts",
    ageSex: "18-24 · Female",
    engagement: 6.2,
    isPrimary: true,
    interests: ["Home Workouts", "Nutrition", "Weight Loss", "Running"],
  },
  {
    id: "2",
    name: "Health-Conscious Millennials",
    ageSex: "25-34 · Mixed",
    engagement: 4.1,
    isPrimary: false,
    interests: ["Mental Health", "Clean Eating", "Yoga", "Wellness"],
  },
];

const MOCK_LOCATIONS: Location[] = [
  { country: "Vietnam",     pct: 38 },
  { country: "Thailand",    pct: 22 },
  { country: "Philippines", pct: 15 },
  { country: "Indonesia",   pct: 12 },
  { country: "Others",      pct: 13 },
];

const MOCK_AGE_GROUPS: AgeGroup[] = [
  { label: "13-17", pct:  8 },
  { label: "18-24", pct: 42 },
  { label: "25-34", pct: 31 },
  { label: "35-44", pct: 14 },
  { label: "45+",   pct:  5 },
];

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="md">
      <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-[22px] font-bold text-gray-900 mt-1">{value}</p>
    </Card>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AudiencePage() {
  // For demo: toggle TikTok connection state
  const [hasTikTok, setHasTikTok] = useState(true);
  const [isLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">

      {/* 1. Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-500" />
          <h1 className="text-[24px] font-bold text-gray-900">Audience Intelligence</h1>
        </div>
        <p className="text-[14px] text-gray-500 mt-1">
          Deep understanding of who follows and engages with your content.
        </p>
      </div>

      {/* 2. Connect Prompt (shown when no TikTok linked) */}
      {!hasTikTok && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[14px] text-amber-700 flex-1">
            Connect a TikTok account to unlock audience insights.
          </p>
          <Button variant="primary" size="sm">
            Connect TikTok
          </Button>
        </div>
      )}

      {/* Demo toggle — remove in production */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setHasTikTok((v) => !v)}
          className="text-[12px] text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
        >
          {hasTikTok ? "Simulate: TikTok not connected" : "Simulate: TikTok connected"}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && <StatsLoadingSkeleton />}

      {/* Connected state — all sections */}
      {hasTikTok && !isLoading && (
        <>
          {/* 3. Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Followers"
              value={MOCK_STATS.totalFollowers.toLocaleString()}
            />
            <StatCard
              label="30-day Growth"
              value={`+${MOCK_STATS.growth30d.toLocaleString()}`}
            />
            <StatCard
              label="Engagement Rate"
              value={`${MOCK_STATS.engagementRate.toFixed(2)}%`}
            />
            <StatCard
              label="Avg Views / Video"
              value={MOCK_STATS.avgViewsPerVideo.toLocaleString()}
            />
          </div>

          {/* 4. Audience Personas */}
          <section>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-3">
              Audience Personas
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {MOCK_PERSONAS.map((persona) => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </div>
          </section>

          {/* 5. Top Locations */}
          <section>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-3">
              Top Locations
            </h2>
            <Card padding="md">
              <div className="flex flex-col gap-3">
                {MOCK_LOCATIONS.map(({ country, pct }) => (
                  <div key={country} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-24 shrink-0">
                      {country}
                    </span>
                    <ProgressBar value={pct} max={100} size="sm" className="flex-1" />
                    <span className="text-xs font-semibold text-gray-500 w-9 text-right">
                      {pct}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 6. Age Distribution */}
          <section>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-3">
              Age Distribution
            </h2>
            <Card padding="md">
              <div className="flex flex-col gap-3">
                {MOCK_AGE_GROUPS.map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-12 shrink-0">{label}</span>
                    <ProgressBar value={pct} max={100} size="sm" className="flex-1" />
                    <span className="text-xs text-gray-500 w-9 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Persona Card sub-component
// ---------------------------------------------------------------------------

function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Card padding="md">
      {/* Header */}
      <div className="flex justify-between items-start">
        <span className="text-[15px] font-semibold text-gray-900">{persona.name}</span>
        {persona.isPrimary && (
          <Badge variant="brand">Primary</Badge>
        )}
      </div>
      {/* Meta */}
      <p className="text-[13px] text-gray-500 mt-1.5">
        {persona.ageSex} · {persona.engagement.toFixed(1)}% engagement
      </p>
      {/* Divider */}
      <hr className="my-3 border-gray-100" />
      {/* Interest tags */}
      <div className="flex flex-wrap gap-1.5">
        {persona.interests.map((interest) => (
          <span
            key={interest}
            className="bg-gray-100 rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-700"
          >
            {interest}
          </span>
        ))}
      </div>
    </Card>
  );
}
