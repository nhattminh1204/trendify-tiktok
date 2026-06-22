"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalendarView = "month" | "week";
type ContentStatus = "scheduled" | "published";

interface CalendarChip {
  title: string;
  status: ContentStatus;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  chips: CalendarChip[];
}

// ---------------------------------------------------------------------------
// Constants — hardcoded content chips for June 2026
// ---------------------------------------------------------------------------

const CHIPS_BY_DAY: Record<number, CalendarChip[]> = {
  3:  [{ title: "Fitness Tips",   status: "published" }],
  7:  [{ title: "5 Myths",        status: "scheduled" }, { title: "Quick Workout", status: "scheduled" }],
  10: [{ title: "Protein Guide",  status: "published" }],
  14: [{ title: "Gym Routine",    status: "scheduled" }],
  18: [{ title: "Diet Facts",     status: "published" }],
  21: [{ title: "Morning Routine",status: "scheduled" }],
  24: [{ title: "HIIT Workout",   status: "scheduled" }, { title: "Meal Prep", status: "scheduled" }],
  28: [{ title: "Cardio Tips",    status: "published" }],
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Week view mock content
const WEEK_CONTENT: Record<string, CalendarChip[]> = {
  "Mon Jun 15": [{ title: "Gym Routine", status: "scheduled" }],
  "Wed Jun 17": [{ title: "Diet Prep", status: "scheduled" }],
  "Fri Jun 19": [{ title: "Diet Facts", status: "published" }],
  "Sun Jun 21": [{ title: "Morning Routine", status: "scheduled" }],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const today = new Date(2026, 5, 21); // June 21 2026

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Weekday of first day (0=Sun … 6=Sat) → convert to Mon-based index
  const firstWeekday = (firstDay.getDay() + 6) % 7; // Mon=0

  const days: CalendarDay[] = [];

  // Fill leading days from previous month
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false, isToday: false, chips: [] });
  }

  // Fill current month days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      chips: CHIPS_BY_DAY[d] ?? [],
    });
  }

  // Fill trailing days to reach 35 cells
  const trailing = 35 - days.length;
  for (let d = 1; d <= trailing; d++) {
    const date = new Date(year, month + 1, d);
    days.push({ date, isCurrentMonth: false, isToday: false, chips: [] });
  }

  return days;
}

function buildWeekDays(): { label: string; date: number; isToday: boolean; chips: CalendarChip[] }[] {
  // Show week of Jun 15–21 2026
  const days = [
    { label: "Mon Jun 15", date: 15 },
    { label: "Tue Jun 16", date: 16 },
    { label: "Wed Jun 17", date: 17 },
    { label: "Thu Jun 18", date: 18 },
    { label: "Fri Jun 19", date: 19 },
    { label: "Sat Jun 20", date: 20 },
    { label: "Sun Jun 21", date: 21 },
  ];
  return days.map((d) => ({
    ...d,
    isToday: d.date === 21,
    chips: WEEK_CONTENT[d.label] ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ContentCalendarPage() {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)); // June 2026
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = buildMonthGrid(year, month);
  const weekDays = buildWeekDays();

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(2026, 5, 1));

  return (
    <div className="flex flex-col gap-5">

      {/* Page Header */}
      <div className="flex justify-between flex-wrap gap-3 items-center">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Content Calendar</h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Plan, schedule, and track your content across time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ai" size="sm" onClick={() => {}}>
            <Sparkles className="w-3.5 h-3.5" />
            Suggest
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowScheduleModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            Schedule Idea
          </Button>
        </div>
      </div>

      {/* Schedule Modal (minimal) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-1">Schedule Idea</h2>
            <p className="text-[13px] text-gray-500 mb-4">Pick a date and idea to schedule.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowScheduleModal(false)}>
                Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Card */}
      <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden p-0">

        {/* Calendar Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          {/* Left: navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[20px] font-semibold text-gray-900 min-w-[160px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={goToNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Today */}
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>

          {/* Right: view toggle + schedule button */}
          <div className="flex items-center gap-2">
            {/* Segmented view toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["month", "week"] as CalendarView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1 text-[13px] font-medium rounded-md capitalize transition-colors",
                    view === v
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Month View */}
        {view === "month" && (
          <>
            {/* Day names row */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
              {DAY_NAMES.map((name) => (
                <div
                  key={name}
                  className="text-[11px] font-medium text-gray-400 uppercase text-center py-2 tracking-wide"
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 border-l border-t border-gray-100">
              {calendarDays.map((day, idx) => (
                <DayCell key={idx} day={day} />
              ))}
            </div>
          </>
        )}

        {/* Week View */}
        {view === "week" && (
          <WeekView days={weekDays} />
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day Cell
// ---------------------------------------------------------------------------

function DayCell({ day }: { day: CalendarDay }) {
  return (
    <div
      className={cn(
        "min-h-[100px] p-2 border-r border-b border-gray-100 relative group",
        !day.isCurrentMonth && "bg-gray-50"
      )}
    >
      {/* Day number */}
      <div className="flex justify-end">
        <span
          className={cn(
            "text-[13px] font-medium",
            day.isCurrentMonth ? "text-gray-400" : "text-gray-300",
            day.isToday &&
              "text-brand-600 font-bold bg-brand-50 w-6 h-6 rounded-full flex items-center justify-center"
          )}
        >
          {day.date.getDate()}
        </span>
      </div>

      {/* Content chips */}
      {day.chips.length > 0 && (
        <div className="mt-1.5 flex flex-col gap-1">
          {day.chips.map((chip, i) => (
            <span
              key={i}
              className={cn(
                "rounded-[6px] px-2 py-0.5 text-[11px] font-medium truncate cursor-pointer block",
                chip.status === "scheduled"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-green-100 text-green-700"
              )}
              title={chip.title}
            >
              {chip.title}
            </span>
          ))}
        </div>
      )}

      {/* + Add button (shows on hover) */}
      {day.isCurrentMonth && (
        <button className="hidden group-hover:flex text-[12px] text-gray-400 hover:text-brand-600 items-center gap-1 mt-1 cursor-pointer transition-colors">
          <Plus className="w-3 h-3" />
          Add
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Week View
// ---------------------------------------------------------------------------

function WeekView({
  days,
}: {
  days: {
    label: string;
    date: number;
    isToday: boolean;
    chips: CalendarChip[];
  }[];
}) {
  return (
    <div className="grid grid-cols-7 min-h-[400px]">
      {days.map((day) => (
        <div key={day.label} className="border-r border-gray-100 last:border-r-0 flex flex-col">
          {/* Column header */}
          <div
            className={cn(
              "py-3 px-2 text-center border-b border-gray-100",
              day.isToday ? "bg-brand-50" : "bg-gray-50"
            )}
          >
            <p
              className={cn(
                "text-[11px] font-medium uppercase tracking-wide",
                day.isToday ? "text-brand-600" : "text-gray-400"
              )}
            >
              {day.label.substring(0, 3)}
            </p>
            <p
              className={cn(
                "text-[18px] font-semibold mt-0.5",
                day.isToday ? "text-brand-600" : "text-gray-900"
              )}
            >
              {day.date}
            </p>
          </div>

          {/* Events */}
          <div className="p-1.5 flex flex-col gap-1 flex-1">
            {day.chips.map((chip, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-[6px] px-2 py-1 text-[11px] font-medium cursor-pointer block",
                  chip.status === "scheduled"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                )}
              >
                {chip.title}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
