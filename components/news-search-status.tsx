"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FetchNewsButton } from "./fetch-news-button"
import { GenerateSummaryButton } from "./generate-summary-button"
import { createClientSupabaseClient } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"

export function NewsSearchStatus() {
  const [latestArticle, setLatestArticle] = useState<any>(null)
  const [articleCount, setArticleCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClientSupabaseClient()

        // Get the latest article
        const { data: latest } = await supabase
          .from("news_articles")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        // Get the total count of articles
        const { count } = await supabase.from("news_articles").select("*", { count: "exact", head: true })

        setLatestArticle(latest)
        setArticleCount(count || 0)
      } catch (error) {
        console.error("Error fetching news status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News Search Status</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading news search status...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>News Search Status</CardTitle>
        <CardDescription>
          {latestArticle
            ? `Last updated ${formatDistanceToNow(new Date(latestArticle.created_at), { addSuffix: true })}`
            : "No articles fetched yet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium">{articleCount} articles in database</p>
        <p className="text-sm text-muted-foreground mt-2">
          Use the buttons below to fetch new articles or generate summaries.
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <FetchNewsButton />
        <GenerateSummaryButton />
      </CardFooter>
    </Card>
  )
}
