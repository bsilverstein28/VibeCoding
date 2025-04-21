import { NextResponse } from "next/server"
import { initializeSources } from "@/lib/database-service"
import { getServerSupabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // First, test the database connection
    const supabase = getServerSupabase()
    const { data: healthCheck, error: healthError } = await supabase.from("sources").select("count(*)").limit(1)

    if (healthError) {
      console.error("Database connection error:", healthError)
      return NextResponse.json(
        {
          success: false,
          error: `Database connection error: ${healthError.message}`,
          details: {
            code: healthError.code,
            hint: healthError.hint,
            details: healthError.details,
          },
        },
        { status: 500 },
      )
    }

    // If connection is successful, proceed with initialization
    await initializeSources()

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      connectionTest: "Passed",
    })
  } catch (error) {
    console.error("Error initializing database:", error)

    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: errorStack,
        env: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 },
    )
  }
}
