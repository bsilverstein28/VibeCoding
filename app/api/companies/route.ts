import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("companies").select("*").order("name")

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          name: body.name,
          website: body.website || null,
          description: body.description || null,
          logo_url: body.logo_url || null,
        },
      ])
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}
