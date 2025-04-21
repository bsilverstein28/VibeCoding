import { NextResponse } from "next/server"
import { researchPicksWithAI } from "@/lib/research-service"
import { format } from "date-fns"
import { logCronEvent, notifyCronStatus } from "@/lib/cron-utils"

// This header is used to verify that the request is coming from Vercel Cron
// and not from an unauthorized source
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const jobName = "daily-research"

  // Check for the authorization header
  const authHeader = request.headers.get("authorization")

  if (!process.env.CRON_SECRET) {
    logCronEvent(jobName, "error", { message: "CRON_SECRET environment variable not set" })
    return NextResponse.json({ error: "CRON_SECRET environment variable not set" }, { status: 500 })
  }

  // Verify the authorization header matches our secret
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    logCronEvent(jobName, "error", { message: "Unauthorized access attempt" })
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get today's date in YYYY-MM-DD format
    const today = format(new Date(), "yyyy-MM-dd")

    logCronEvent(jobName, "start", { date: today })

    // Run the research process for today
    const results = await researchPicksWithAI(today)

    const pickCount = {
      spreads: results.spreads.length,
      totals: results.totals.length,
      playerProps: results.playerProps.length,
      total: results.spreads.length + results.totals.length + results.playerProps.length,
    }

    // Check if we got any picks
    if (pickCount.total === 0) {
      logCronEvent(jobName, "warning", { message: "No picks found", date: today })
      await notifyCronStatus(jobName, "error", { message: "No picks found", date: today })

      return NextResponse.json({
        warning: true,
        message: "Daily research completed but no picks were found",
        date: today,
        pickCount,
      })
    }

    logCronEvent(jobName, "success", { date: today, pickCount })
    await notifyCronStatus(jobName, "success", { date: today, pickCount })

    return NextResponse.json({
      success: true,
      message: "Daily research completed successfully",
      date: today,
      pickCount,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logCronEvent(jobName, "error", { message: errorMessage })
    await notifyCronStatus(jobName, "error", { message: errorMessage })

    return NextResponse.json(
      {
        error: "Failed to run daily research",
        message: errorMessage,
      },
      { status: 500 },
    )
  }
}
