"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { analyticsService } from "@/lib/analytics-service"

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view on route change
    analyticsService.trackPageView(pathname)
  }, [pathname])

  return null
}
