import { NextResponse } from "next/server"
import { generateNewsSummary } from "@/lib/ai-summarization"

// Helper function to safely stringify objects for logging
function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, (key, value) => (typeof value === "bigint" ? value.toString() : value), 2)
  } catch (error) {
    return `[Error stringifying object: ${error instanceof Error ? error.message : String(error)}]`
  }
}

export async function POST(request: Request) {
  console.log("API: /api/summaries/generate called")

  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("Request body:", safeStringify(body))
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
      // Check if OpenAI API key is configured
      const openaiKey = process.env.OPENAI_API_KEY
      console.log("OpenAI API key configured:", openaiKey ? "Yes" : "No")

      // Generate the summary
      const result = await generateNewsSummary(companyIds)
      console.log(
        "Summary generation result:",
        safeStringify({
          success: result.success,
          articleCount: result.articleCount,
          usedAI: result.usedAI,
          message: result.message,
        }),
      )

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
      console.error("Error in summary generation:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate summary",
          error: error instanceof Error ? error.message : String(error),
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  } catch (error) {
    console.error("Unexpected error in API route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
