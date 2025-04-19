import { createServerSupabaseClient } from "./supabase"
import { sendEmail, formatSummaryEmail } from "./email"

export async function sendSummaryEmail(summaryId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const supabase = createServerSupabaseClient()

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("email_notifications", true)
      .not("email", "is", null)
      .limit(1)
      .single()

    if (preferencesError) {
      if (preferencesError.code === "PGRST116") {
        // No preferences found or notifications disabled
        return {
          success: false,
          message: "No users with email notifications enabled",
        }
      }
      throw preferencesError
    }

    if (!preferences.email) {
      return {
        success: false,
        message: "No email address configured for notifications",
      }
    }

    // Get the summary
    const { data: summary, error: summaryError } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("id", summaryId)
      .single()

    if (summaryError) {
      throw summaryError
    }

    // Get the companies included in the summary
    const { data: summaryCompanies, error: companiesError } = await supabase
      .from("summary_companies")
      .select("companies(*)")
      .eq("summary_id", summaryId)

    if (companiesError) {
      throw companiesError
    }

    const companies = summaryCompanies.map((sc) => sc.companies).filter(Boolean)

    // Get the articles included in the summary
    const { data: summaryArticles, error: articlesError } = await supabase
      .from("summary_articles")
      .select("news_articles(*)")
      .eq("summary_id", summaryId)

    if (articlesError) {
      throw articlesError
    }

    const articles = summaryArticles.map((sa) => sa.news_articles).filter(Boolean)

    // Format the email
    const { text, html } = formatSummaryEmail(summary, articles, companies)

    // Send the email
    const emailSent = await sendEmail({
      to: preferences.email,
      subject: `Daily Tech News Summary - ${new Date(summary.summary_date).toLocaleDateString()}`,
      text,
      html,
    })

    if (!emailSent) {
      return {
        success: false,
        message: "Failed to send email",
      }
    }

    return {
      success: true,
      message: `Summary email sent to ${preferences.email}`,
    }
  } catch (error) {
    console.error("Error sending summary email:", error)
    return {
      success: false,
      message: `Error sending summary email: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
