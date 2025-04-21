"use server"

import { updatePickResult } from "@/lib/database-service"
import { revalidatePath } from "next/cache"

/**
 * Update the result of a consensus pick
 */
export async function updatePickResultAction(pickId: string, result: "win" | "loss" | "push") {
  try {
    await updatePickResult(pickId, result)
    revalidatePath("/admin")
    revalidatePath("/history")
    return { success: true }
  } catch (error) {
    console.error("Error updating pick result:", error)
    return { success: false, error: "Failed to update pick result" }
  }
}

/**
 * Trigger a new research run
 */
export async function triggerResearchAction(date: string) {
  try {
    const { researchPicksWithAI } = await import("@/lib/research-service")
    await researchPicksWithAI(date)
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error triggering research:", error)
    return { success: false, error: "Failed to trigger research" }
  }
}

/**
 * Trigger the cron job manually
 * This keeps the CRON_SECRET on the server side
 */
export async function triggerCronJobAction() {
  try {
    // Get the base URL safely
    const baseUrl = getBaseUrl()

    const response = await fetch(`${baseUrl}/api/cron/daily-research`, {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || ""}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Error triggering cron job:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Helper function to get the base URL for API calls
 * Works in both development and production environments
 */
function getBaseUrl() {
  // Check for custom domain in production (highest priority)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Check for VERCEL_URL (production on Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Default to hardcoded URL in production or localhost in development
  return process.env.NODE_ENV === "production"
    ? "https://benbets.vercel.app" // Hardcoded production URL
    : "http://localhost:3000"
}
