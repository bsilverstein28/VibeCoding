import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerSupabaseClient } from "./supabase"
import { getOpenAIConfig } from "./ai-config"

// Simple fallback summary generator that doesn't use AI
async function generateFallbackSummary(articles: any[]): Promise<string> {
  try {
    // Sort articles by date (newest first)
    const sortedArticles = [...articles].sort((a, b) => {
      if (!a.published_date || !b.published_date) return 0
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })

    // Get unique company names
    const companies = [...new Set(sortedArticles.map((article) => article.companies?.name).filter(Boolean))]

    // Create a simple summary
    let summary = `This is an automated summary of recent news about ${companies.join(", ")}.

`

    // Add top 5 article titles
    summary += `Top headlines:
`
    sortedArticles.slice(0, 5).forEach((article, index) => {
      summary += `${index + 1}. ${article.title} (${article.source || "Unknown source"})
`
    })

    summary += `
This summary covers ${articles.length} articles from ${companies.length} companies.`

    return summary
  } catch (error) {
    console.error("Error in fallback summary generation:", error)
    return "Unable to generate a summary at this time. Please try again later."
  }
}

export async function generateNewsSummary(companyIds: string[] = []) {
  try {
    const supabase = createServerSupabaseClient()
    let useAI = true

    // Check if OpenAI API key is configured
    const aiConfig = getOpenAIConfig()
    if (!aiConfig) {
      console.log("OpenAI API key not configured, using fallback summary generation")
      useAI = false
    }

    // Get recent articles for the specified companies or all companies if none specified
    try {
      const query = supabase
        .from("news_articles")
        .select(`
          id, 
          title, 
          url, 
          source, 
          summary, 
          published_date,
          companies (
            id,
            name,
            category
          )
        `)
        .order("published_date", { ascending: false })
        .limit(20)

      if (companyIds && companyIds.length > 0) {
        query.in("company_id", companyIds)
      }

      const { data: articles, error } = await query

      if (error) {
        console.error("Database query error:", error)
        return {
          success: false,
          message: `Database error: ${error.message}`,
        }
      }

      if (!articles || articles.length === 0) {
        return {
          success: false,
          message: "No recent articles found to summarize",
        }
      }

      // Determine the categories of companies in the articles
      const categories = [...new Set(articles.map((article: any) => article.companies?.category).filter(Boolean))]

      // If no categories found, use the default category
      let categoryToUse = categories.length > 0 ? categories[0] : "Default"

      // If multiple categories, prioritize the most common one
      if (categories.length > 1) {
        const categoryCounts = categories.reduce((acc: Record<string, number>, category: string) => {
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})

        categoryToUse = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
      }

      // Get the appropriate prompt for this category
      let promptToUse = null
      try {
        const { data: categoryPrompt, error: promptError } = await supabase
          .from("category_prompts")
          .select("*")
          .eq("category", categoryToUse)
          .single()

        if (promptError && promptError.code !== "PGRST116") {
          console.error("Error fetching category prompt:", promptError)
        } else {
          promptToUse = categoryPrompt
        }
      } catch (promptError) {
        console.error("Error fetching category prompt:", promptError)
      }

      // Fall back to default if no specific prompt is found
      if (!promptToUse) {
        try {
          const { data: defaultPrompt, error: defaultPromptError } = await supabase
            .from("category_prompts")
            .select("*")
            .eq("category", "Default")
            .single()

          if (defaultPromptError) {
            console.error("Error fetching default prompt:", defaultPromptError)
            useAI = false
          } else {
            promptToUse = defaultPrompt
          }
        } catch (defaultPromptError) {
          console.error("Error fetching default prompt:", defaultPromptError)
          useAI = false
        }
      }

      let summaryText = ""

      if (useAI && promptToUse && aiConfig) {
        try {
          // Format articles for the AI prompt
          const articlesText = articles
            .map((article: any) => {
              return `
Title: ${article.title}
Source: ${article.source || "Unknown"}
Company: ${article.companies?.name || "Unknown"}
Category: ${article.companies?.category || "Unknown"}
Summary: ${article.summary || "No summary available"}
              `.trim()
            })
            .join("\n\n")

          console.log("Generating AI summary using OpenAI...")

          // Generate the summary using AI with the category-specific prompt
          try {
            const { text } = await generateText({
              model: openai(aiConfig.model),
              prompt: `${promptToUse.user_prompt}\n\nARTICLES:\n${articlesText}`,
              system: promptToUse.system_prompt,
              temperature: 0.7, // Add some variability
              maxTokens: 1000, // Limit response size
            })

            summaryText = text
            console.log("AI summary generated successfully")
          } catch (aiGenError) {
            console.error("Error during AI text generation:", aiGenError)
            throw aiGenError
          }
        } catch (aiError) {
          console.error("AI generation error:", aiError)
          // Fall back to simple summary generation
          console.log("Falling back to simple summary generation")
          summaryText = await generateFallbackSummary(articles)
          useAI = false
        }
      } else {
        // Use fallback summary generation
        summaryText = await generateFallbackSummary(articles)
        useAI = false
      }

      try {
        // Create a new summary in the database
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
          return {
            success: false,
            message: `Error creating summary: ${summaryError.message}`,
          }
        }

        // Link the summary to companies
        try {
          if (companyIds && companyIds.length > 0) {
            const summaryCompaniesData = companyIds.map((companyId) => ({
              summary_id: summary.id,
              company_id: companyId,
            }))

            await supabase.from("summary_companies").insert(summaryCompaniesData)
          } else {
            // If no specific companies were provided, link to all companies that had articles
            const uniqueCompanyIds = [...new Set(articles.map((article: any) => article.companies?.id).filter(Boolean))]

            const summaryCompaniesData = uniqueCompanyIds.map((companyId) => ({
              summary_id: summary.id,
              company_id: companyId,
            }))

            await supabase.from("summary_companies").insert(summaryCompaniesData)
          }
        } catch (linkError) {
          console.error("Error linking summary to companies:", linkError)
          // Continue despite this error
        }

        // Link the summary to articles
        try {
          const summaryArticlesData = articles.map((article: any) => ({
            summary_id: summary.id,
            article_id: article.id,
          }))

          await supabase.from("summary_articles").insert(summaryArticlesData)
        } catch (articleLinkError) {
          console.error("Error linking summary to articles:", articleLinkError)
          // Continue despite this error
        }

        return {
          success: true,
          summary: summary,
          articleCount: articles.length,
          category: categoryToUse,
          usedAI: useAI,
        }
      } catch (dbError) {
        console.error("Database operation error:", dbError)
        return {
          success: false,
          message: `Database operation error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        }
      }
    } catch (queryError) {
      console.error("Error querying database:", queryError)
      return {
        success: false,
        message: `Error querying database: ${queryError instanceof Error ? queryError.message : String(queryError)}`,
      }
    }
  } catch (error) {
    console.error("Error generating news summary:", error)
    return {
      success: false,
      message: `Failed to generate news summary: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
