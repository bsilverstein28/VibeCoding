import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing database connection...")
    const supabase = createServerSupabaseClient()

    // Try a simple query
    const { data, error } = await supabase.from("companies").select("count").limit(1)

    if (error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Database connection error",
          error: error.message,
          details: error,
        },
        { status: 500 },
      )
    }

    // Check if we can query the category_prompts table
    const { data: promptsData, error: promptsError } = await supabase.from("category_prompts").select("count").limit(1)

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      companiesData: data,
      promptsData: promptsData,
      promptsError: promptsError ? promptsError.message : null,
    })
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error testing database connection",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
