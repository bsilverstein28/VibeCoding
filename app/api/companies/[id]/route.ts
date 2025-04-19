import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    console.log(`Deleting company with ID: ${id}`)

    // First, delete related records in summary_companies
    const { error: summaryCompaniesError } = await supabase.from("summary_companies").delete().eq("company_id", id)

    if (summaryCompaniesError) {
      console.error("Error deleting related summary_companies:", summaryCompaniesError)
    }

    // Delete related news articles
    const { data: articles, error: articlesQueryError } = await supabase
      .from("news_articles")
      .select("id")
      .eq("company_id", id)

    if (!articlesQueryError && articles && articles.length > 0) {
      const articleIds = articles.map((article) => article.id)

      // Delete related records in summary_articles
      const { error: summaryArticlesError } = await supabase
        .from("summary_articles")
        .delete()
        .in("article_id", articleIds)

      if (summaryArticlesError) {
        console.error("Error deleting related summary_articles:", summaryArticlesError)
      }

      // Delete the news articles
      const { error: deleteArticlesError } = await supabase.from("news_articles").delete().eq("company_id", id)

      if (deleteArticlesError) {
        console.error("Error deleting related news articles:", deleteArticlesError)
      }
    }

    // Finally, delete the company
    const { error: deleteCompanyError } = await supabase.from("companies").delete().eq("id", id)

    if (deleteCompanyError) {
      console.error("Error deleting company:", deleteCompanyError)
      return NextResponse.json({ error: `Failed to delete company: ${deleteCompanyError.message}` }, { status: 500 })
    }

    console.log(`Successfully deleted company with ID: ${id}`)

    // Return with cache control headers to prevent caching
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 })
  }
}
