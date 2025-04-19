import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { CompaniesListClient } from "@/components/companies-list-client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

async function getCompanies() {
  const supabase = createServerSupabaseClient()
  const { data: companies } = await supabase.from("companies").select("*").order("name")
  return companies || []
}

function CompaniesList() {
  return (
    <Suspense fallback={<CompaniesSkeleton />}>
      <CompaniesListContent />
    </Suspense>
  )
}

async function CompaniesListContent() {
  const companies = await getCompanies()
  return <CompaniesListClient initialCompanies={companies} />
}

function CompaniesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Button asChild>
          <Link href="/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Link>
        </Button>
      </div>

      <CompaniesList />
    </div>
  )
}
