import type { AnalyticsConfig } from "@vercel/analytics/react"

export const analyticsConfig: AnalyticsConfig = {
  debug: process.env.NODE_ENV === "development",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
}
