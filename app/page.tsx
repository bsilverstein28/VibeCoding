import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, RefreshCw } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { GenerateSummaryButton } from "@/components/generate-summary-button"
import { NewsSearchStatus } from "@/components/news-search-status"

async function getLatestSummary() {
  const supabase = createServerSupabaseClient()

  const { data: summary } = await supabase
    .from("daily_summaries")
    .select("*, summary_companies(company_id, companies(name))")
    .order("summary_date", { ascending: false })
    .limit(1)
    .single()

  return summary
}

async function getTrackedCompanies() {
  const supabase = createServerSupabaseClient()

  const { data: companies } = await supabase.from("companies").select("*").order("name")

  return companies || []
}

async function getRecentArticles() {
  const supabase = createServerSupabaseClient()

  const { data: articles } = await supabase
    .from("news_articles")
    .select("*, companies(name)")
    .order("published_date", { ascending: false })
    .limit(5)

  return articles || []
}

function LatestSummary() {
  return (
    <Suspense fallback={<SummarySkeleton />}>
      <LatestSummaryContent />
    </Suspense>
  )
}

async function LatestSummaryContent() {
  const summary = await getLatestSummary()

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Summary</CardTitle>
          <CardDescription>No summaries available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Add companies to track and wait for the daily summary to be generated.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild>
            <Link href="/companies/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Link>
          </Button>
          <GenerateSummaryButton />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Summary</CardTitle>
        <CardDescription>
          {new Date(summary.summary_date).toLocaleDateString()} -
          {summary.summary_companies?.map((sc: any) => sc.companies?.name).join(", ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert">
          <p>{summary.summary_text}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link href={`/summaries/${summary.id}`}>View Details</Link>
        </Button>
        <GenerateSummaryButton />
      </CardFooter>
    </Card>
  )
}

function SummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-40" />
      </CardFooter>
    </Card>
  )
}

function TrackedCompanies() {
  return (
    <Suspense fallback={<CompaniesSkeleton />}>
      <TrackedCompaniesContent />
    </Suspense>
  )
}

async function TrackedCompaniesContent() {
  const companies = await getTrackedCompanies()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tracked Companies</CardTitle>
          <CardDescription>Companies you are currently tracking</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href="/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <p className="text-muted-foreground">No companies added yet.</p>
        ) : (
          <div className="space-y-2">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{company.name}</p>
                  {company.website && <p className="text-sm text-muted-foreground">{company.website}</p>}
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/companies/${company.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CompaniesSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-20" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentArticles() {
  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <RecentArticlesContent />
    </Suspense>
  )
}

async function RecentArticlesContent() {
  const articles = await getRecentArticles()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Articles</CardTitle>
        <CardDescription>Latest news about your tracked companies</CardDescription>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <p className="text-muted-foreground">No articles found yet.</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="border-b pb-4">
                <h3 className="font-medium">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {article.title}
                  </a>
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground">
                    {article.companies?.name} • {article.source}
                  </p>
                  {article.published_date && (
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(article.published_date), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline">
          <Link href="/articles">View All Articles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function ArticlesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b pb-4">
              <Skeleton className="h-5 w-full mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <NewsSearchStatus />
        <LatestSummary />
      </div>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
        </TabsList>
        <TabsContent value="companies" className="mt-4">
          <TrackedCompanies />
        </TabsContent>
        <TabsContent value="articles" className="mt-4">
          <RecentArticles />
        </TabsContent>
      </Tabs>
    </div>
  )
}
