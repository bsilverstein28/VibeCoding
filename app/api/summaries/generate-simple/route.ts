import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Simple fallback summary generator
function generateSimpleSummary(articles: any[]): string {
  try {
    // Sort articles by date (newest first)
    const sortedArticles = [...articles].sort((a, b) => {
      if (!a.published_date || !b.published_date) return 0
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })

    // Get unique company names
    const companies = [...new Set(articles.map((article) => article.companies?.name).filter(Boolean))]

    // Create a simple summary
    let summary = "This is an automated summary of recent tech news.\n\n"

    // Add top 5 article titles
    summary += "Top headlines:\n"
    sortedArticles.slice(0, 5).forEach((article, index) => {
      summary += `${index + 1}. ${article.title} (${article.source || "Unknown source"})\n`
    })

    summary += `\nThis summary covers ${articles.length} articles from ${companies.length} companies.`

    return summary
  } catch (error) {
    console.error("Error in simple summary generation:", error)
    return "Unable to generate a summary at this time. Please try again later."
  }
}

export async function POST() {
  try {
    // Initialize Supabase client
    const supabase = createServerSupabaseClient()

    // Fetch recent articles
    const { data: articles, error } = await supabase
      .from("news_articles")
      .select("id, title, url, source, published_date, companies(id, name)")
      .order("published_date", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Database query error:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch articles",
        },
        { status: 500 },
      )
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No articles found to summarize",
        },
        { status: 404 },
      )
    }

    // Generate a simple summary
    const summaryText = generateSimpleSummary(articles)

    // Save the summary to the database
    const today = new Date().toISOString().split("T")[0]
    const { data: summary, error: summaryError } = await supabase
      .from("daily_summaries")
      .insert({
        summary_date: today,
        summary_text: summaryText,
      })
      .select()
      .single()

    if (summaryError) {
      console.error("Error creating summary:", summaryError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save summary",
        },
        { status: 500 },
      )
    }

    // Link the summary to articles
    try {
      const summaryArticlesData = articles.map((article) => ({
        summary_id: summary.id,
        article_id: article.id,
      }))

      await supabase.from("summary_articles").insert(summaryArticlesData)
    } catch (linkError) {
      console.error("Error linking summary to articles:", linkError)
      // Continue despite this error
    }

    // Link the summary to companies
    try {
      const uniqueCompanyIds = [...new Set(articles.map((article) => article.companies?.id).filter(Boolean))]

      if (uniqueCompanyIds.length > 0) {
        const summaryCompaniesData = uniqueCompanyIds.map((companyId) => ({
          summary_id: summary.id,
          company_id: companyId,
        }))

        await supabase.from("summary_companies").insert(summaryCompaniesData)
      }
    } catch (companyLinkError) {
      console.error("Error linking summary to companies:", companyLinkError)
      // Continue despite this error
    }

    // Return success response
    return NextResponse.json({
      success: true,
      summary: summary,
      articleCount: articles.length,
    })
  } catch (error) {
    console.error("Error in generate-simple API route:", error)

    // Always return a valid JSON response, even for unexpected errors
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
