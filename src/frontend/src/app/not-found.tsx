"use client"

import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-[480px] text-center">
        <p className="text-[120px] font-extrabold text-gray-100 leading-none select-none">
          404
        </p>
        <Compass className="w-14 h-14 text-gray-300 -mt-4 mx-auto" />
        <h1 className="text-[28px] font-bold text-gray-900 mt-4">
          Page not found
        </h1>
        <p className="text-[15px] text-gray-600 mt-2 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go back
          </Button>
        </div>
        <p className="mt-6 text-[13px]">
          <a
            href="mailto:support@trendify.app"
            className="text-brand-600 hover:underline"
          >
            Need help? Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
