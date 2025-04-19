import { NextResponse } from "next/server"

/**
 * Safely handles API errors and ensures a proper JSON response
 */
export function handleApiError(error: unknown, defaultMessage = "An unexpected error occurred") {
  console.error("API Error:", error)

  const errorMessage = error instanceof Error ? error.message : String(error)

  return NextResponse.json(
    {
      success: false,
      message: defaultMessage,
      error: errorMessage,
    },
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}
