import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { generateNewsSummary } from "@/lib/ai-summarization"
import { fetchAndSaveNewsForAllCompanies } from "@/lib/news-api"
import { sendSummaryEmail } from "@/lib/send-summary-email"

// This would be triggered by a cron job daily
export async function GET() {
  try {
    // 1. Get all companies we're tracking
    const supabase = createServerSupabaseClient()
    const { data: companies } = await supabase.from("companies").select("*")

    if (!companies || companies.length === 0) {
      return NextResponse.json({ message: "No companies to search for" })
    }

    // 2. Fetch news articles for all companies
    const newsResult = await fetchAndSaveNewsForAllCompanies(1) // Get news from the past day

    // 3. Get company IDs for summarization
    const companyIds = companies.map((company) => company.id)

    // 4. Generate AI summary of the articles
    const summaryResult = await generateNewsSummary(companyIds)

    // 5. Send email notification if summary was generated successfully
    let emailResult = { success: false, message: "No summary generated" }

    if (summaryResult.success && summaryResult.summary) {
      emailResult = await sendSummaryEmail(summaryResult.summary.id)
    }

    return NextResponse.json({
      success: true,
      message: "Daily search and summarization completed",
      newsResult,
      summary: summaryResult.success ? summaryResult.summary : null,
      articleCount: summaryResult.success ? summaryResult.articleCount : 0,
      emailSent: emailResult.success,
      emailMessage: emailResult.message,
    })
  } catch (error) {
    console.error("Error in daily search:", error)
    return NextResponse.json({ error: "Failed to complete daily search" }, { status: 500 })
  }
}
