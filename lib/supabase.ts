import { createClient } from "@supabase/supabase-js"

// Types for our database tables
export type ResearchRun = {
  id: string
  run_date: string
  target_date: string
  model_used: string
  status: string
  pick_count: number
  duration_ms: number | null
  created_at: string
}

export type Source = {
  id: string
  name: string
  url: string
  created_at: string
}

export type ConsensusPick = {
  id: string
  research_run_id: string
  pick_date: string
  type: "spread" | "total" | "player_prop"
  title: string
  matchup: string
  pick: string
  consensus_strength: number
  rationale: string
  result: "win" | "loss" | "push" | "pending"
  created_at: string
  updated_at: string
  sources?: { name: string; url: string }[]
}

export type PickSource = {
  pick_id: string
  source_id: string
  source_url: string
}

// Create a single supabase client for the entire server-side application
const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Create a single supabase client for client-side usage
const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Use a singleton pattern to avoid creating multiple instances
let serverClient: ReturnType<typeof createClient> | null = null
let browserClient: ReturnType<typeof createClient> | null = null

export function getServerSupabase() {
  if (!serverClient) {
    serverClient = createServerClient()
  }
  return serverClient
}

export function getBrowserSupabase() {
  if (typeof window === "undefined") {
    throw new Error("Browser Supabase client cannot be used on the server")
  }

  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}
