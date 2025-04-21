import { NextResponse } from "next/server"
import { researchPicksWithAI } from "@/lib/research-service"
import { format } from "date-fns"
import { logCronEvent } from "@/lib/cron-utils"

// Only allow this endpoint in development mode
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  // Check if we're in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 })
  }

  const jobName = "test-cron"

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

    logCronEvent(jobName, "success", { date: today, pickCount })

    return NextResponse.json({
      success: true,
      message: "Test cron job completed successfully",
      date: today,
      pickCount,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logCronEvent(jobName, "error", { message: errorMessage })

    return NextResponse.json(
      {
        error: "Failed to run test cron job",
        message: errorMessage,
      },
      { status: 500 },
    )
  }
}
