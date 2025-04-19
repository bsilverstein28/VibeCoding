import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Continue with the request
    const response = NextResponse.next()

    // Add headers to ensure proper content type
    response.headers.set("Content-Type", "application/json")

    // Add CORS headers to prevent issues
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  }

  // For non-API routes, just continue
  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
