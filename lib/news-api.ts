import { createServerSupabaseClient } from "./supabase"

// Types for NewsAPI responses
type NewsAPIArticle = {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

type NewsAPIResponse = {
  status: string
  totalResults: number
  articles: NewsAPIArticle[]
}

/**
 * Fetches news articles for a specific company
 */
export async function fetchCompanyNews(companyName: string, daysBack = 1) {
  try {
    // Calculate the date range
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - daysBack)

    // Format dates for the API
    const fromDateStr = fromDate.toISOString().split("T")[0]
    const toDateStr = toDate.toISOString().split("T")[0]

    // Create the API URL with query parameters
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) {
      throw new Error("NEWS_API_KEY environment variable is not set")
    }

    // Construct the search query - we'll search for the company name in the title or content
    // We'll also add some tech-related terms to filter for tech news
    const query = encodeURIComponent(`"${companyName}" AND (technology OR tech OR software OR digital OR AI OR cloud)`)

    const url = `https://newsapi.org/v2/everything?q=${query}&from=${fromDateStr}&to=${toDateStr}&sortBy=publishedAt&language=en&apiKey=${apiKey}`

    // Fetch the news articles
    const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`NewsAPI request failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    if (data.status !== "ok") {
      throw new Error(`NewsAPI returned status: ${data.status}`)
    }

    return data.articles || []
  } catch (error) {
    console.error(`Error fetching news for ${companyName}:`, error)
    throw error
  }
}

/**
 * Saves news articles to the database
 */
export async function saveArticlesToDatabase(articles: NewsAPIArticle[], companyId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Process each article
    const results = []

    for (const article of articles) {
      // Check if the article already exists in the database
      const { data: existingArticle } = await supabase
        .from("news_articles")
        .select("id")
        .eq("url", article.url)
        .maybeSingle()

      // Skip if the article already exists
      if (existingArticle) {
        results.push({ status: "skipped", url: article.url })
        continue
      }

      // Insert the new article
      const { data, error } = await supabase
        .from("news_articles")
        .insert({
          company_id: companyId,
          title: article.title,
          url: article.url,
          source: article.source.name,
          published_date: article.publishedAt,
          summary: article.description,
        })
        .select()

      if (error) {
        results.push({ status: "error", url: article.url, error })
      } else {
        results.push({ status: "inserted", url: article.url, id: data[0].id })
      }
    }

    return {
      total: articles.length,
      inserted: results.filter((r) => r.status === "inserted").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      errors: results.filter((r) => r.status === "error").length,
      details: results,
    }
  } catch (error) {
    console.error("Error saving articles to database:", error)
    throw error
  }
}

/**
 * Fetches and saves news for all tracked companies
 */
export async function fetchAndSaveNewsForAllCompanies(daysBack = 1) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if the API key is set
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) {
      throw new Error("NEWS_API_KEY environment variable is not set")
    }

    // Get all tracked companies
    const { data: companies, error } = await supabase.from("companies").select("id, name")

    if (error) {
      throw error
    }

    if (!companies || companies.length === 0) {
      return { message: "No companies to search for", companiesProcessed: 0, results: [] }
    }

    // Process each company
    const results = []

    for (const company of companies) {
      try {
        // Fetch news for this company
        const articles = await fetchCompanyNews(company.name, daysBack)

        // Save articles to the database
        const saveResult = await saveArticlesToDatabase(articles, company.id)

        results.push({
          company: company.name,
          companyId: company.id,
          ...saveResult,
        })
      } catch (error) {
        console.error(`Error processing company ${company.name}:`, error)
        results.push({
          company: company.name,
          companyId: company.id,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        })
      }

      // Add a small delay between API calls to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return {
      success: true,
      companiesProcessed: companies.length,
      results,
    }
  } catch (error) {
    console.error("Error in fetchAndSaveNewsForAllCompanies:", error)
    throw error
  }
}
