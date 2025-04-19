"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DeleteCompanyButton } from "@/components/delete-company-button"
import { createClientSupabaseClient } from "@/lib/supabase"

type Company = {
  id: string
  name: string
  website: string | null
  description: string | null
  logo_url: string | null
  category: string | null
  created_at: string
  updated_at: string
}

export function CompaniesListClient({ initialCompanies }: { initialCompanies: Company[] }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [isLoading, setIsLoading] = useState(false)

  const fetchCompanies = async () => {
    setIsLoading(true)
    try {
      const supabase = createClientSupabaseClient()
      const { data } = await supabase.from("companies").select("*").order("name")
      if (data) {
        setCompanies(data)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompanyDeleted = (deletedId: string) => {
    // Update the local state immediately
    setCompanies((prevCompanies) => prevCompanies.filter((company) => company.id !== deletedId))
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Companies</CardTitle>
          <CardDescription>You haven't added any companies to track yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Add your first company to start tracking news about it.</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/companies/new">Add Company</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <Card key={company.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
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
              </div>
              {company.category && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {company.category}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {company.description ? (
              <p className="text-sm text-muted-foreground">{company.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline" size="sm">
              <Link href={`/companies/${company.id}`}>View News</Link>
            </Button>
            <DeleteCompanyButton
              companyId={company.id}
              companyName={company.name}
              onDeleted={() => handleCompanyDeleted(company.id)}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
