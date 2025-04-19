"use client"

import { Analytics as VercelAnalytics } from "@vercel/analytics/react"
import { analyticsConfig } from "@/app/analytics-config"

export function Analytics() {
  return <VercelAnalytics {...analyticsConfig} />
}
