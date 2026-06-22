"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  Zap,
  FileText,
  Hash,
  Sparkles,
  Pencil,
  CheckCircle2,
  Video,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContentPipelineStepper } from "@/components/content/pipeline-stepper"

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockIdea = {
  title: "5 fitness myths debunked",
  status: "draft" as "draft" | "approved" | "published" | "archived",
  niche: "Fitness",
  aiGenerated: true,
  createdAt: "Jun 20, 2026",
  hook: "You've been doing this wrong your entire life…",
  scriptOutline: [
    {
      step: 1,
      label: "Hook",
      timing: "0-3s",
      content: "Open with shocking question about common fitness mistake.",
    },
    {
      step: 2,
      label: "Problem Setup",
      timing: "3-10s",
      content: "Most people believe that more cardio means faster results…",
    },
    {
      step: 3,
      label: "Main Content",
      timing: "10-45s",
      content:
        "Myth 1: Cardio is everything. Myth 2: No pain, no gain. Myth 3: Spot reduction works. Myth 4: Carbs are the enemy. Myth 5: You need supplements.",
    },
    {
      step: 4,
      label: "CTA",
      timing: "45-60s",
      content: "Follow for daily fitness science!",
    },
  ],
  hashtags: [
    "#fitness",
    "#fitnessmyths",
    "#workout",
    "#healthylifestyle",
    "#gymtips",
  ],
  aiSuggestions: [
    "Add a text overlay on the hook frame to stop the scroll faster.",
    "Try posting between 7–9 PM on weekdays for peak Fitness audience activity.",
    "Use trending audio from the Fitness niche to boost discoverability by up to 40%.",
  ],
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({
  icon,
  label,
  action,
}: {
  icon: React.ReactNode
  label: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[15px] font-semibold text-gray-900">{label}</span>
      </div>
      {action}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContentIdeaDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const idea = { ...mockIdea, id }

  const [status, setStatus] = useState(idea.status)

  const handleApprove = () => setStatus("approved")

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-[13px] flex items-center gap-1.5">
        <Link href="/dashboard/content" className="text-gray-400 hover:text-gray-700 transition-colors">
          Content
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">{idea.title}</span>
      </nav>

      {/* Pipeline stepper */}
      <div className="flex justify-center py-2">
        <ContentPipelineStepper id={id} currentStep={1} />
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">{idea.title}</h1>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge variant={status}>{status}</Badge>
            <Badge variant="default">{idea.niche}</Badge>
            {idea.aiGenerated && <Badge variant="ai">AI Generated</Badge>}
            <span className="text-[12px] text-gray-400">
              Created {idea.createdAt}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {status === "draft" && (
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 border border-green-300 text-green-700 hover:bg-green-50 rounded-lg h-9 px-3 text-sm font-medium transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
          )}
          <Button variant="ghost" size="md">
            Archive
          </Button>
          <Link href={`/dashboard/content/${id}/media`}>
            <Button variant="primary">
              <Video className="w-4 h-4" />
              Tiếp theo: Media →
            </Button>
          </Link>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 mt-2">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Hook */}
          <Card padding="lg">
            <SectionHeader
              icon={<Zap className="w-4 h-4 text-brand-500" />}
              label="Hook"
              action={
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              }
            />
            <p className="text-[16px] text-gray-900 italic mt-3 leading-relaxed">
              &ldquo;{idea.hook}&rdquo;
            </p>
          </Card>

          {/* Script Outline */}
          <Card padding="lg">
            <SectionHeader
              icon={<FileText className="w-4 h-4 text-brand-500" />}
              label="Script Outline"
            />
            <ol className="flex flex-col gap-3 mt-3">
              {idea.scriptOutline.map((item) => (
                <li key={item.step}>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-semibold text-brand-600">
                      {item.step}.
                    </span>
                    <span className="text-[13px] font-semibold text-gray-900">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-1">
                      {item.timing}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-600 mt-0.5 pl-4">
                    {item.content}
                  </p>
                </li>
              ))}
            </ol>
          </Card>

          {/* Hashtags */}
          <Card padding="lg">
            <SectionHeader
              icon={<Hash className="w-4 h-4 text-brand-500" />}
              label="Hashtags"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {idea.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 rounded-full px-3 py-1 text-[13px] text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Details */}
          <Card padding="lg">
            <p className="text-[14px] font-semibold text-gray-900 mb-3">
              Details
            </p>
            <ul className="flex flex-col gap-2.5">
              <li className="flex gap-2">
                <span className="text-[12px] text-gray-500 w-20 flex-shrink-0 pt-0.5">
                  Niche
                </span>
                <span className="text-[13px] font-medium text-gray-900">
                  {idea.niche}
                </span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-[12px] text-gray-500 w-20 flex-shrink-0">
                  Status
                </span>
                <Badge variant={status}>{status}</Badge>
              </li>
              <li className="flex gap-2">
                <span className="text-[12px] text-gray-500 w-20 flex-shrink-0 pt-0.5">
                  Created
                </span>
                <span className="text-[13px] font-medium text-gray-900">
                  {idea.createdAt}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[12px] text-gray-500 w-20 flex-shrink-0 pt-0.5">
                  AI Generated
                </span>
                <span className="text-[13px] font-medium text-gray-900">
                  {idea.aiGenerated ? "Yes" : "No"}
                </span>
              </li>
            </ul>
          </Card>

          {/* Quick publish shortcut */}
          <Link href={`/dashboard/content/${id}/publish`}>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 cursor-pointer hover:bg-brand-100 transition-colors">
              <p className="text-[13px] font-semibold text-brand-800">Lên lịch & Đăng bài</p>
              <p className="text-[12px] text-brand-600 mt-0.5">Bỏ qua các bước → đến thẳng Publish</p>
            </div>
          </Link>

          {/* AI Suggestions */}
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-[14px] font-semibold text-violet-800">
                AI Suggestions
              </span>
            </div>
            <ul className="flex flex-col gap-2.5 mt-3">
              {idea.aiSuggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-300 mt-1.5 flex-shrink-0" />
                  <span className="text-[13px] text-gray-700 flex-1">
                    {suggestion}
                  </span>
                  <button className="text-xs text-brand-600 hover:underline ml-auto flex-shrink-0 cursor-pointer">
                    Apply
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
