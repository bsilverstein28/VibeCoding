import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ success: false, message: "Email address is required" }, { status: 400 })
    }

    console.log(`Sending test email to: ${email}`)

    // Check environment variables
    if (!process.env.POSTMARK_API_TOKEN) {
      console.error("POSTMARK_API_TOKEN is not set")
      return NextResponse.json(
        {
          success: false,
          message: "Email service is not configured: Missing POSTMARK_API_TOKEN",
        },
        { status: 500 },
      )
    }

    if (!process.env.EMAIL_FROM) {
      console.error("EMAIL_FROM is not set")
      return NextResponse.json(
        {
          success: false,
          message: "Email service is not configured: Missing EMAIL_FROM",
        },
        { status: 500 },
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://adtechnews.vercel.app"
    console.log(`Using app URL: ${appUrl}`)

    const result = await sendEmail({
      to: email,
      subject: "Test Email from Tech News Aggregator",
      text: "This is a test email from your Tech News Aggregator application. If you're receiving this, your email configuration is working correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6; font-size: 24px;">Test Email</h1>
          <p style="margin: 20px 0; line-height: 1.6; color: #1f2937;">
            This is a test email from your Tech News Aggregator application. 
            If you're receiving this, your email configuration is working correctly!
          </p>
          <div style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
            <p>This email was sent from your Tech News Aggregator.</p>
            <p>App URL: ${appUrl}</p>
            <p>From: ${process.env.EMAIL_FROM}</p>
          </div>
        </div>
      `,
    })

    if (!result.success) {
      console.error("Failed to send test email:", result.message)
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
    })
  } catch (error) {
    console.error("Error in test-email API route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
