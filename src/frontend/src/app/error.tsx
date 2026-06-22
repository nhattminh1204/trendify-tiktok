"use client"

import { CloudOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-[480px] text-center">
        <CloudOff className="w-16 h-16 text-gray-300 mx-auto" />
        <h1 className="text-[28px] font-bold text-gray-900 mt-5">
          Something went wrong
        </h1>
        <p className="text-[15px] text-gray-600 mt-2 max-w-sm mx-auto">
          We&apos;re having trouble connecting right now. Please try refreshing
          the page.
        </p>
        <p className="text-xs text-gray-400 mt-3">
          Error 500 &middot; Internal Server Error
          {error.digest && (
            <span className="ml-1">&middot; {error.digest}</span>
          )}
        </p>
        <div className="flex flex-col gap-2.5 items-center mt-8">
          <Button variant="primary" onClick={reset}>
            <RefreshCw className="w-4 h-4" />
            Refresh page
          </Button>
          <Button variant="ghost">Contact support</Button>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          If this keeps happening, check{" "}
          <a
            href="https://status.trendify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            status.trendify.app
          </a>
        </p>
      </div>
    </div>
  )
}
