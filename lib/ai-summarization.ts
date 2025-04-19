import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerSupabaseClient } from "./supabase"
import { getOpenAIConfig } from "./ai-config"

// Simple fallback summary generator that doesn't use AI
async function generateFallbackSummary(articles: any[]): Promise<string> {
  try {
    console.log("Generating fallback summary for", articles.length, "articles")

    // Sort articles by date (newest first)
    const sortedArticles = [...articles].sort((a, b) => {
      if (!a.published_date || !b.published_date) return 0
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })

    // Get unique company names
    const companies = [...new Set(articles.map((article) => article.companies?.name).filter(Boolean))]
    console.log("Companies in articles:", companies)

    // Create a simple summary
    let summary = "This is an automated summary of recent news about " + companies.join(", ") + ".\n\n"

    // Add top 5 article titles
    summary += "Top headlines:\n"
    sortedArticles.slice(0, 5).forEach((article, index) => {
      summary += index + 1 + ". " + article.title + " (" + (article.source || "Unknown source") + ")\n"
    })

    summary += "\nThis summary covers " + articles.length + " articles from " + companies.length + " companies."

    return summary
  } catch (error) {
    console.error("Error in fallback summary generation:", error)
    return "Unable to generate a summary at this time. Please try again later."
  }
}

export async function generateNewsSummary(companyIds: string[] = []) {
  console.log("Starting generateNewsSummary function")

  try {
    // Step 1: Initialize Supabase client
    console.log("Initializing Supabase client")
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      console.error("Failed to create Supabase client")
      return {
        success: false,
        message: "Failed to initialize database connection",
      }
    }

    // Step 2: Check if OpenAI API key is configured
    console.log("Checking OpenAI configuration")
    let useAI = true
    const aiConfig = getOpenAIConfig()
    if (!aiConfig) {
      console.log("OpenAI API key not configured, will use fallback summary generation")
      useAI = false
    }

    // Step 3: Fetch articles from the database
    console.log("Fetching articles from database")
    let articles: any[] = []
    try {
      const query = supabase
        .from("news_articles")
        .select("id, title, url, source, summary, published_date, companies(id, name, category)")
        .order("published_date", { ascending: false })
        .limit(20)

      if (companyIds && companyIds.length > 0) {
        query.in("company_id", companyIds)
      }

      const { data, error } = await query

      if (error) {
        console.error("Database query error:", error)
        return {
          success: false,
          message: "Database error: " + error.message,
        }
      }

      articles = data || []
      console.log("Fetched", articles.length, "articles from database")

      if (articles.length === 0) {
        console.log("No articles found to summarize")
        return {
          success: false,
          message: "No recent articles found to summarize",
        }
      }
    } catch (queryError) {
      console.error("Error querying database:", queryError)
      return {
        success: false,
        message: "Error querying database: " + (queryError instanceof Error ? queryError.message : String(queryError)),
      }
    }

    // Step 4: Generate a summary text (either with AI or fallback)
    console.log("Preparing to generate summary")
    let summaryText = ""
    let categoryToUse = "Default"

    // Try to determine the category
    try {
      const categories = [...new Set(articles.map((article) => article.companies?.category).filter(Boolean))]
      console.log("Categories found in articles:", categories)

      // If no categories found, use the default category
      categoryToUse = categories.length > 0 ? categories[0] : "Default"

      // If multiple categories, prioritize the most common one
      if (categories.length > 1) {
        const categoryCounts = categories.reduce((acc: Record<string, number>, category: string) => {
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})

        categoryToUse = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
      }

      console.log("Selected category for summary:", categoryToUse)
    } catch (categoryError) {
      console.error("Error determining category:", categoryError)
      // Continue with default category
    }

    // Generate the summary text
    if (useAI && aiConfig) {
      try {
        console.log("Attempting to generate AI summary")

        // Get the appropriate prompt for this category
        let promptToUse = null
        try {
          console.log("Fetching prompt for category:", categoryToUse)
          const { data: categoryPrompt, error: promptError } = await supabase
            .from("category_prompts")
            .select("*")
            .eq("category", categoryToUse)
            .single()

          if (promptError) {
            if (promptError.code === "PGRST116") {
              console.log("No specific prompt found for category:", categoryToUse)
            } else {
              console.error("Error fetching category prompt:", promptError)
            }
          } else {
            promptToUse = categoryPrompt
            console.log("Found prompt for category:", categoryToUse)
          }
        } catch (promptError) {
          console.error("Exception fetching category prompt:", promptError)
        }

        // Fall back to default if no specific prompt is found
        if (!promptToUse) {
          try {
            console.log("Fetching default prompt")
            const { data: defaultPrompt, error: defaultPromptError } = await supabase
              .from("category_prompts")
              .select("*")
              .eq("category", "Default")
              .single()

            if (defaultPromptError) {
              console.error("Error fetching default prompt:", defaultPromptError)
              console.log("Will use fallback summary generation")
              useAI = false
            } else {
              promptToUse = defaultPrompt
              console.log("Using default prompt")
            }
          } catch (defaultPromptError) {
            console.error("Exception fetching default prompt:", defaultPromptError)
            useAI = false
          }
        }

        // If we have a prompt and AI is enabled, generate the summary
        if (promptToUse && useAI) {
          try {
            // Format articles for the AI prompt
            console.log("Formatting articles for AI prompt")
            const formattedArticles = articles.map((article) => {
              return [
                "Title: " + article.title,
                "Source: " + (article.source || "Unknown"),
                "Company: " + (article.companies?.name || "Unknown"),
                "Category: " + (article.companies?.category || "Unknown"),
                "Summary: " + (article.summary || "No summary available"),
              ].join("\n")
            })

            const articlesText = formattedArticles.join("\n\n")
            const userPrompt = promptToUse.user_prompt + "\n\nARTICLES:\n" + articlesText

            console.log("Generating AI summary using OpenAI...")

            // Generate the summary using AI with the category-specific prompt
            const { text } = await generateText({
              model: openai(aiConfig.model),
              prompt: userPrompt,
              system: promptToUse.system_prompt,
              temperature: 0.7, // Add some variability
              maxTokens: 1000, // Limit response size
            })

            summaryText = text
            console.log("AI summary generated successfully")
          } catch (aiGenError) {
            console.error("Error during AI text generation:", aiGenError)
            console.log("Falling back to simple summary generation")
            summaryText = await generateFallbackSummary(articles)
            useAI = false
          }
        } else {
          // No prompt or AI disabled
          console.log("No prompt available or AI disabled, using fallback")
          summaryText = await generateFallbackSummary(articles)
          useAI = false
        }
      } catch (aiError) {
        console.error("AI generation error:", aiError)
        console.log("Falling back to simple summary generation")
        summaryText = await generateFallbackSummary(articles)
        useAI = false
      }
    } else {
      // AI not enabled
      console.log("AI not enabled, using fallback summary generation")
      summaryText = await generateFallbackSummary(articles)
      useAI = false
    }

    // Step 5: Save the summary to the database
    console.log("Saving summary to database")
    try {
      const today = new Date().toISOString().split("T")[0]
      console.log("Creating summary record with date:", today)

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
          message: "Error creating summary: " + summaryError.message,
        }
      }

      console.log("Summary created with ID:", summary.id)

      // Step 6: Link the summary to companies
      console.log("Linking summary to companies")
      try {
        if (companyIds && companyIds.length > 0) {
          console.log("Using provided company IDs:", companyIds)
          const summaryCompaniesData = companyIds.map((companyId) => ({
            summary_id: summary.id,
            company_id: companyId,
          }))

          const { error: linkError } = await supabase.from("summary_companies").insert(summaryCompaniesData)
          if (linkError) {
            console.error("Error linking summary to companies:", linkError)
          }
        } else {
          // If no specific companies were provided, link to all companies that had articles
          const uniqueCompanyIds = [...new Set(articles.map((article) => article.companies?.id).filter(Boolean))]
          console.log("Extracted company IDs from articles:", uniqueCompanyIds)

          if (uniqueCompanyIds.length > 0) {
            const summaryCompaniesData = uniqueCompanyIds.map((companyId) => ({
              summary_id: summary.id,
              company_id: companyId,
            }))

            const { error: linkError } = await supabase.from("summary_companies").insert(summaryCompaniesData)
            if (linkError) {
              console.error("Error linking summary to companies:", linkError)
            }
          }
        }
      } catch (linkError) {
        console.error("Exception linking summary to companies:", linkError)
        // Continue despite this error
      }

      // Step 7: Link the summary to articles
      console.log("Linking summary to articles")
      try {
        const summaryArticlesData = articles.map((article) => ({
          summary_id: summary.id,
          article_id: article.id,
        }))

        const { error: articleLinkError } = await supabase.from("summary_articles").insert(summaryArticlesData)
        if (articleLinkError) {
          console.error("Error linking summary to articles:", articleLinkError)
        }
      } catch (articleLinkError) {
        console.error("Exception linking summary to articles:", articleLinkError)
        // Continue despite this error
      }

      console.log("Summary generation completed successfully")
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
        message: "Database operation error: " + (dbError instanceof Error ? dbError.message : String(dbError)),
      }
    }
  } catch (error) {
    console.error("Error generating news summary:", error)
    return {
      success: false,
      message: "Failed to generate news summary: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}
