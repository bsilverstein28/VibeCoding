import { NextResponse } from "next/server"
import { ServerClient } from "postmark"

export async function GET() {
  try {
    // Check environment variables (mask sensitive data)
    const config = {
      postmarkApiToken: process.env.POSTMARK_API_TOKEN ? "Set (masked)" : "Not set",
      emailFrom: process.env.EMAIL_FROM || "Not set",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "Not set",
    }

    // Test Postmark connection
    let postmarkStatus = "Unknown"
    let serverInfo = null

    if (process.env.POSTMARK_API_TOKEN) {
      try {
        const client = new ServerClient(process.env.POSTMARK_API_TOKEN)
        const response = await client.getServer()
        postmarkStatus = "Connected"
        serverInfo = {
          name: response.Name,
          color: response.Color,
          serverLink: response.ServerLink,
          apiTokensAccessible: response.ApiTokensAccessible,
          smtpApiActivated: response.SmtpApiActivated,
        }
      } catch (error) {
        postmarkStatus = `Error: ${error instanceof Error ? error.message : String(error)}`
      }
    } else {
      postmarkStatus = "Not configured (missing API token)"
    }

    return NextResponse.json({
      config,
      postmark: {
        status: postmarkStatus,
        serverInfo,
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in email-config debug endpoint:", error)
    return NextResponse.json(
      {
        error: "Failed to check email configuration",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
