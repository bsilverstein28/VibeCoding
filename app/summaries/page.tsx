import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"

async function getSummaries() {
  const supabase = createServerSupabaseClient()

  const { data: summaries } = await supabase
    .from("daily_summaries")
    .select("*, summary_companies(company_id, companies(name))")
    .order("summary_date", { ascending: false })

  return summaries || []
}

function SummariesList() {
  return (
    <Suspense fallback={<SummariesSkeleton />}>
      <SummariesListContent />
    </Suspense>
  )
}

async function SummariesListContent() {
  const summaries = await getSummaries()

  if (summaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Summaries</CardTitle>
          <CardDescription>No daily summaries have been generated yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Summaries will be generated daily for your tracked companies.</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/companies">Manage Companies</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {summaries.map((summary) => {
        const companyNames = summary.summary_companies?.map((sc: any) => sc.companies?.name).filter(Boolean)

        return (
          <Card key={summary.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daily Summary</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(summary.summary_date).toLocaleDateString()}
                </div>
              </div>
              <CardDescription>
                {companyNames?.length > 0 ? `Companies: ${companyNames.join(", ")}` : "All tracked companies"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="line-clamp-3">{summary.summary_text}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={`/summaries/${summary.id}`}>View Full Summary</Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

function SummariesSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-48 mt-1" />
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

export default function SummariesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Daily Summaries</h1>
      <SummariesList />
    </div>
  )
}
