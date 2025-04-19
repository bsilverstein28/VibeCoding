import { NextResponse } from "next/server"
import { fetchAndSaveNewsForAllCompanies } from "@/lib/news-api"

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
        { status: 400 },
      )
    }

    const { daysBack = 7 } = body // Default to 7 days if not specified

    try {
      const result = await fetchAndSaveNewsForAllCompanies(daysBack)

      return NextResponse.json({
        success: true,
        ...result,
      })
    } catch (fetchError) {
      console.error("Error in fetchAndSaveNewsForAllCompanies:", fetchError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch news",
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in news/fetch API route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
