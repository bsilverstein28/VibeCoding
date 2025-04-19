import { NextResponse } from "next/server"
import { generateNewsSummary } from "@/lib/ai-summarization"
import { handleApiError } from "@/lib/api-utils"

export async function POST(request: Request) {
  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format: Could not parse JSON body",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const { companyIds } = body || {}

    console.log("Generating summary for companies:", companyIds || "all companies")

    try {
      const result = await generateNewsSummary(companyIds)

      if (!result.success) {
        console.error("Summary generation failed:", result.message)
        return NextResponse.json(
          {
            success: false,
            message: result.message || "Failed to generate summary",
          },
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }

      return NextResponse.json(
        {
          success: true,
          summary: result.summary,
          articleCount: result.articleCount,
          usedAI: result.usedAI,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    } catch (error) {
      return handleApiError(error, "Failed to generate summary")
    }
  } catch (error) {
    return handleApiError(error, "An unexpected error occurred")
  }
}
