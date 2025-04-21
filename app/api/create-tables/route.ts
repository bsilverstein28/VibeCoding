import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = getServerSupabase()

    // Create sources table if it doesn't exist
    const { error: sourcesError } = await supabase.rpc("create_tables")

    if (sourcesError) {
      console.error("Error creating tables:", sourcesError)
      return NextResponse.json(
        {
          success: false,
          error: `Error creating tables: ${sourcesError.message}`,
          details: {
            code: sourcesError.code,
            hint: sourcesError.hint,
            details: sourcesError.details,
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
    })
  } catch (error) {
    console.error("Error creating database tables:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: errorStack,
      },
      { status: 500 },
    )
  }
}
