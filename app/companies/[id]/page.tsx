import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"

async function getCompany(id: string) {
  const supabase = createServerSupabaseClient()

  const { data: company } = await supabase.from("companies").select("*").eq("id", id).single()

  if (!company) {
    notFound()
  }

  return company
}

async function getCompanyArticles(companyId: string) {
  const supabase = createServerSupabaseClient()

  const { data: articles } = await supabase
    .from("news_articles")
    .select("*")
    .eq("company_id", companyId)
    .order("published_date", { ascending: false })

  return articles || []
}

function CompanyDetails({ id }: { id: string }) {
  return (
    <Suspense fallback={<CompanyDetailsSkeleton />}>
      <CompanyDetailsContent id={id} />
    </Suspense>
  )
}

async function CompanyDetailsContent({ id }: { id: string }) {
  const company = await getCompany(id)

  return (
    <Card>
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
      <CardContent>
        {company.description ? (
          <p className="text-muted-foreground">{company.description}</p>
        ) : (
          <p className="text-muted-foreground italic">No description provided</p>
        )}
      </CardContent>
    </Card>
  )
}

function CompanyDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}

function CompanyArticles({ id }: { id: string }) {
  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <CompanyArticlesContent id={id} />
    </Suspense>
  )
}

async function CompanyArticlesContent({ id }: { id: string }) {
  const articles = await getCompanyArticles(id)

  if (articles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Articles Found</CardTitle>
          <CardDescription>We haven't found any news articles for this company yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Articles will appear here once they are discovered by our daily search.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
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
            <CardDescription className="flex items-center">
              {article.source && <span className="mr-2">{article.source}</span>}
              {article.published_date && (
                <span className="flex items-center text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
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
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read Full Article
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function ArticlesSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-32" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default function CompanyPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button asChild variant="ghost" size="sm" className="mr-4">
          <Link href="/companies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Company News</h1>
      </div>

      <div className="space-y-8">
        <CompanyDetails id={params.id} />

        <div>
          <h2 className="text-2xl font-bold mb-4">Latest Articles</h2>
          <CompanyArticles id={params.id} />
        </div>
      </div>
    </div>
  )
}
