import { getServerSupabase } from "./supabase"
import type { ConsensusPick, ResearchRun, Source, PickSource } from "./supabase"
import { BETTING_SITES } from "./research-service"

/**
 * Initialize the database with betting sources
 */
export async function initializeSources(): Promise<void> {
  const supabase = getServerSupabase()

  try {
    // Check if the sources table exists by attempting a query
    const { data: tableCheck, error: tableError } = await supabase.from("sources").select("count(*)").limit(1).single()

    if (tableError) {
      // If the table doesn't exist, we need to create it
      if (tableError.code === "PGRST116") {
        console.log("Sources table doesn't exist, creating it...")

        // Create the sources table
        const { error: createError } = await supabase.rpc("create_sources_table")

        if (createError) {
          throw new Error(`Failed to create sources table: ${createError.message}`)
        }
      } else {
        throw new Error(`Error checking sources table: ${tableError.message}`)
      }
    }

    // Check if sources already exist
    const { data: existingSources, error: countError } = await supabase.from("sources").select("name")

    if (countError) {
      throw new Error(`Error checking existing sources: ${countError.message}`)
    }

    if (existingSources && existingSources.length > 0) {
      console.log(`Sources already initialized (${existingSources.length} sources found)`)
      return
    }

    // Insert betting sites as sources
    const sourcesToInsert = BETTING_SITES.map((site) => ({
      name: site.name,
      url: site.url,
    }))

    const { error: insertError } = await supabase.from("sources").insert(sourcesToInsert)

    if (insertError) {
      throw new Error(`Error inserting sources: ${insertError.message}`)
    }

    console.log(`Sources initialized successfully (${sourcesToInsert.length} sources added)`)
  } catch (error) {
    console.error("Error in initializeSources:", error)
    throw error
  }
}

/**
 * Get all sources from the database
 */
export async function getSources(): Promise<Source[]> {
  const supabase = getServerSupabase()

  const { data, error } = await supabase.from("sources").select("*").order("name")

  if (error) {
    console.error("Error getting sources:", error)
    throw error
  }

  return data || []
}

/**
 * Create a new research run
 */
export async function createResearchRun(targetDate: string, modelUsed: string): Promise<ResearchRun> {
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from("research_runs")
    .insert({
      target_date: targetDate,
      model_used: modelUsed,
      status: "in_progress",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating research run:", error)
    throw error
  }

  return data
}

/**
 * Update a research run with results
 */
export async function updateResearchRun(
  id: string,
  status: string,
  pickCount: number,
  durationMs: number,
): Promise<void> {
  const supabase = getServerSupabase()

  const { error } = await supabase
    .from("research_runs")
    .update({
      status,
      pick_count: pickCount,
      duration_ms: durationMs,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating research run:", error)
    throw error
  }
}

/**
 * Get recent research runs
 */
export async function getRecentResearchRuns(limit = 10): Promise<ResearchRun[]> {
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from("research_runs")
    .select("*")
    .order("run_date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error getting research runs:", error)
    throw error
  }

  return data || []
}

/**
 * Save consensus picks to the database
 */
export async function saveConsensusPicks(
  researchRunId: string,
  pickDate: string,
  picks: {
    type: "spread" | "total" | "player_prop"
    title: string
    matchup: string
    pick: string
    consensusStrength: number
    rationale: string
    sources: { name: string; url: string }[]
  }[],
): Promise<void> {
  const supabase = getServerSupabase()

  // Get source IDs for all sources
  const { data: sourcesData, error: sourcesError } = await supabase.from("sources").select("id, name")

  if (sourcesError) {
    console.error("Error getting sources:", sourcesError)
    throw sourcesError
  }

  const sourceMap = new Map<string, string>()
  sourcesData?.forEach((source) => {
    sourceMap.set(source.name, source.id)
  })

  // Begin transaction
  for (const pick of picks) {
    try {
      // Insert consensus pick
      const { data: pickData, error: pickError } = await supabase
        .from("consensus_picks")
        .insert({
          research_run_id: researchRunId,
          pick_date: pickDate,
          type: pick.type,
          title: pick.title,
          matchup: pick.matchup,
          pick: pick.pick,
          consensus_strength: pick.consensusStrength,
          rationale: pick.rationale,
        })
        .select("id")
        .single()

      if (pickError) {
        console.error("Error saving consensus pick:", pickError)
        continue // Skip this pick and try the next one
      }

      // Filter out sources that don't exist in our database and map to pick sources
      const validSources = pick.sources
        .map((source) => {
          const sourceId = sourceMap.get(source.name)
          return sourceId ? { pick_id: pickData.id, source_id: sourceId, source_url: source.url } : null
        })
        .filter((source): source is PickSource => source !== null)

      // Only insert if we have valid sources
      if (validSources.length > 0) {
        const { error: sourcesInsertError } = await supabase.from("pick_sources").insert(validSources)

        if (sourcesInsertError) {
          console.error("Error saving pick sources:", sourcesInsertError)
          // Continue anyway - we at least saved the pick
        }
      } else {
        console.warn(`No valid sources found for pick: ${pick.title}`)
      }
    } catch (error) {
      console.error(`Error processing pick ${pick.title}:`, error)
      // Continue with the next pick
    }
  }
}

/**
 * Get consensus picks for a specific date
 */
export async function getConsensusPicksForDate(date: string): Promise<ConsensusPick[]> {
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from("consensus_picks_with_sources")
    .select("*")
    .eq("pick_date", date)
    .order("consensus_strength", { ascending: false })

  if (error) {
    console.error("Error getting consensus picks:", error)
    throw error
  }

  return data || []
}

/**
 * Update pick result
 */
export async function updatePickResult(pickId: string, result: "win" | "loss" | "push"): Promise<void> {
  const supabase = getServerSupabase()

  const { error } = await supabase.from("consensus_picks").update({ result }).eq("id", pickId)

  if (error) {
    console.error("Error updating pick result:", error)
    throw error
  }
}

/**
 * Get historical pick results
 */
export async function getHistoricalResults(startDate: string, endDate: string): Promise<ConsensusPick[]> {
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from("consensus_picks_with_sources")
    .select("*")
    .gte("pick_date", startDate)
    .lte("pick_date", endDate)
    .not("result", "eq", "pending")
    .order("pick_date", { ascending: false })

  if (error) {
    console.error("Error getting historical results:", error)
    throw error
  }

  return data || []
}

/**
 * Calculate win-loss statistics
 */
export async function getWinLossStats(
  startDate: string,
  endDate: string,
): Promise<{
  wins: number
  losses: number
  pushes: number
  winPercentage: number
  spreadRecord: string
  spreadWinPercentage: number
  totalRecord: string
  totalWinPercentage: number
  propRecord: string
  propWinPercentage: number
}> {
  const picks = await getHistoricalResults(startDate, endDate)

  const wins = picks.filter((p) => p.result === "win").length
  const losses = picks.filter((p) => p.result === "loss").length
  const pushes = picks.filter((p) => p.result === "push").length

  const spreadPicks = picks.filter((p) => p.type === "spread")
  const spreadWins = spreadPicks.filter((p) => p.result === "win").length
  const spreadLosses = spreadPicks.filter((p) => p.result === "loss").length

  const totalPicks = picks.filter((p) => p.type === "total")
  const totalWins = totalPicks.filter((p) => p.result === "win").length
  const totalLosses = totalPicks.filter((p) => p.result === "loss").length

  const propPicks = picks.filter((p) => p.type === "player_prop")
  const propWins = propPicks.filter((p) => p.result === "win").length
  const propLosses = propPicks.filter((p) => p.result === "loss").length

  return {
    wins,
    losses,
    pushes,
    winPercentage: wins / (wins + losses) || 0,
    spreadRecord: `${spreadWins}-${spreadLosses}`,
    spreadWinPercentage: spreadWins / (spreadWins + spreadLosses) || 0,
    totalRecord: `${totalWins}-${totalLosses}`,
    totalWinPercentage: totalWins / (totalWins + totalLosses) || 0,
    propRecord: `${propWins}-${propLosses}`,
    propWinPercentage: propWins / (propWins + propLosses) || 0,
  }
}

/**
 * Ensure all required sources exist in the database
 * This is useful when the AI returns sources that don't match our predefined list
 */
export async function ensureSourcesExist(sources: { name: string; url: string }[]): Promise<void> {
  const supabase = getServerSupabase()

  // Get existing sources
  const { data: existingSources, error: fetchError } = await supabase.from("sources").select("name")

  if (fetchError) {
    console.error("Error fetching existing sources:", fetchError)
    return
  }

  const existingSourceNames = new Set(existingSources?.map((s) => s.name) || [])

  // Filter out sources that already exist
  const newSources = sources.filter((source) => !existingSourceNames.has(source.name))

  if (newSources.length === 0) {
    return // No new sources to add
  }

  // Insert new sources
  const { error: insertError } = await supabase.from("sources").insert(newSources)

  if (insertError) {
    console.error("Error inserting new sources:", insertError)
  } else {
    console.log(`Added ${newSources.length} new sources to the database`)
  }
}
