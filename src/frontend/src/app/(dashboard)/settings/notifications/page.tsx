"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Select } from "@/components/ui/input";

interface NotificationToggles {
  // In-App
  newTrending: boolean;
  aiJobCompleted: boolean;
  budgetWarning: boolean;
  newRecommendation: boolean;
  contentApproved: boolean;
  // Email
  weeklyDigest: boolean;
  monthlySummary: boolean;
  budgetAlertEmail: boolean;
  productUpdates: boolean;
}

const DEFAULT_TOGGLES: NotificationToggles = {
  newTrending: true,
  aiJobCompleted: true,
  budgetWarning: true,
  newRecommendation: true,
  contentApproved: false,
  weeklyDigest: true,
  monthlySummary: false,
  budgetAlertEmail: true,
  productUpdates: false,
};

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex justify-between items-center py-3.5">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function NotificationsPage() {
  const [toggles, setToggles] = useState<NotificationToggles>(DEFAULT_TOGGLES);

  function toggle(key: keyof NotificationToggles) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose what alerts you receive and when.
        </p>
      </div>

      {/* In-App Notifications Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900">
          In-App Notifications
        </h2>
        <p className="text-[13px] text-gray-500 mt-1 mb-2">
          Shown inside the app in real time.
        </p>
        <div className="flex flex-col divide-y divide-gray-50">
          <ToggleRow
            label="New trending topic"
            description="Get notified when a new trend matches your niche."
            checked={toggles.newTrending}
            onChange={() => toggle("newTrending")}
          />
          <ToggleRow
            label="AI job completed"
            description="Alert when an AI generation or analysis finishes."
            checked={toggles.aiJobCompleted}
            onChange={() => toggle("aiJobCompleted")}
          />
          <ToggleRow
            label="Budget warning"
            description="In-app alert when AI spending approaches the limit."
            checked={toggles.budgetWarning}
            onChange={() => toggle("budgetWarning")}
          />
          <ToggleRow
            label="New recommendation"
            description="Alert when the AI engine surfaces a new content idea."
            checked={toggles.newRecommendation}
            onChange={() => toggle("newRecommendation")}
          />
          <ToggleRow
            label="Content approved"
            description="Notify when a team member approves a content piece."
            checked={toggles.contentApproved}
            onChange={() => toggle("contentApproved")}
          />
        </div>
      </Card>

      {/* Email Notifications Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900">
          Email Notifications
        </h2>
        <p className="text-[13px] text-gray-500 mt-1 mb-2">
          Delivered to your registered email address.
        </p>
        <div className="flex flex-col divide-y divide-gray-50">
          <ToggleRow
            label="Weekly trend digest"
            description="A curated summary of top trends every Monday."
            checked={toggles.weeklyDigest}
            onChange={() => toggle("weeklyDigest")}
          />
          <ToggleRow
            label="Monthly analytics summary"
            description="High-level performance report at the end of each month."
            checked={toggles.monthlySummary}
            onChange={() => toggle("monthlySummary")}
          />
          <ToggleRow
            label="Budget alert email"
            description="Email when AI spending hits 80% of the monthly limit."
            checked={toggles.budgetAlertEmail}
            onChange={() => toggle("budgetAlertEmail")}
          />
          <ToggleRow
            label="Product updates"
            description="Occasional emails about new Trendify features."
            checked={toggles.productUpdates}
            onChange={() => toggle("productUpdates")}
          />
        </div>
      </Card>

      {/* Notification Schedule Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900">Quiet Hours</h2>
        <p className="text-[13px] text-gray-500 mt-1 mb-4">
          We won&apos;t send notifications during this time.
        </p>

        {/* Time range */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[13px] text-gray-600">From</span>
          <input
            type="time"
            defaultValue="22:00"
            style={{ width: "120px" }}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-brand-500 transition-colors duration-150"
          />
          <span className="text-[13px] text-gray-600">To</span>
          <input
            type="time"
            defaultValue="08:00"
            style={{ width: "120px" }}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-brand-500 transition-colors duration-150"
          />
        </div>

        {/* Timezone */}
        <div className="mt-4">
          <Select label="Timezone" defaultValue="Asia/Ho_Chi_Minh">
            <option value="Asia/Ho_Chi_Minh">
              Asia/Ho_Chi_Minh (UTC+7)
            </option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
          </Select>
        </div>
      </Card>
    </div>
  );
}
