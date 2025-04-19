import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { SendEmailButton } from "@/components/send-email-button"

async function getSummary(id: string) {
  const supabase = createServerSupabaseClient()

  const { data: summary } = await supabase
    .from("daily_summaries")
    .select(`
      *,
      summary_companies(
        company_id,
        companies(id, name, website)
      ),
      summary_articles(
        article_id,
        news_articles(id, title, url, source, published_date, summary, companies(name))
      )
    `)
    .eq("id", id)
    .single()

  if (!summary) {
    notFound()
  }

  return summary
}

function SummaryDetails({ id }: { id: string }) {
  return (
    <Suspense fallback={<SummaryDetailsSkeleton />}>
      <SummaryDetailsContent id={id} />
    </Suspense>
  )
}

async function SummaryDetailsContent({ id }: { id: string }) {
  const summary = await getSummary(id)

  const companies = summary.summary_companies
    ?.map((sc: any) => sc.companies)
    .filter(Boolean)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  const articles = summary.summary_articles
    ?.map((sa: any) => sa.news_articles)
    .filter(Boolean)
    .sort((a: any, b: any) => {
      if (!a.published_date || !b.published_date) return 0
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
          <CardDescription className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date(summary.summary_date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>{summary.summary_text}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline">
            <Link href="/summaries">View All Summaries</Link>
          </Button>
          <SendEmailButton summaryId={summary.id} />
        </CardFooter>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Companies Covered</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies?.map((company: any) => (
            <Card key={company.id}>
              <CardHeader>
                <CardTitle>{company.name}</CardTitle>
                {company.website && (
                  <CardDescription>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:underline"
                    >
                      {company.website}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </CardDescription>
                )}
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/companies/${company.id}`}>View Company</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Referenced Articles</h2>
        <div className="space-y-4">
          {articles?.map((article: any) => (
            <Card key={article.id}>
              <CardHeader>
                <CardTitle>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-start"
                  >
                    {article.title}
                    <ExternalLink className="ml-1 h-4 w-4 flex-shrink-0" />
                  </a>
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <span>
                    {article.companies?.name} • {article.source}
                  </span>
                  {article.published_date && (
                    <span className="text-xs">
                      {formatDistanceToNow(new Date(article.published_date), { addSuffix: true })}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              {article.summary && (
                <CardContent>
                  <p className="text-sm">{article.summary}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function SummaryDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-9 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SummaryPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button asChild variant="ghost" size="sm" className="mr-4">
          <Link href="/summaries">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Summaries
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Summary Details</h1>
      </div>

      <SummaryDetails id={params.id} />
    </div>
  )
}
