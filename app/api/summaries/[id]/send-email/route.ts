import { NextResponse } from "next/server"
import { sendSummaryEmail } from "@/lib/send-summary-email"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const summaryId = params.id

    if (!summaryId) {
      return NextResponse.json({ success: false, message: "Summary ID is required" }, { status: 400 })
    }

    const result = await sendSummaryEmail(summaryId)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error("Error sending summary email:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send summary email",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
