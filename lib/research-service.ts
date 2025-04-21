import { generateText } from "ai"
import { getBestAvailableModel } from "./ai-models"
import { format, subDays } from "date-fns"
import {
  createResearchRun,
  ensureSourcesExist,
  getConsensusPicksForDate,
  getHistoricalResults as getHistoricalResultsFromDb,
  getWinLossStats,
  saveConsensusPicks,
  updateResearchRun,
} from "./database-service"
import type { ConsensusPick } from "./supabase"

// List of betting sites to research
export const BETTING_SITES = [
  { name: "ESPN Betting", url: "https://www.espn.com/betting/nba/" },
  { name: "Action Network", url: "https://www.actionnetwork.com/nba/picks" },
  { name: "CBS Sports", url: "https://www.cbssports.com/nba/picks/" },
  { name: "The Athletic", url: "https://theathletic.com/nba/betting/" },
  { name: "Vegas Insider", url: "https://www.vegasinsider.com/nba/odds/las-vegas/" },
  { name: "Covers", url: "https://www.covers.com/nba/picks-predictions" },
  { name: "Odds Shark", url: "https://www.oddsshark.com/nba" },
  { name: "Sporting News", url: "https://www.sportingnews.com/us/nba" },
  { name: "Rotogrinders", url: "https://rotogrinders.com/sports/nba" },
  { name: "Bleacher Report", url: "https://bleacherreport.com/nba-betting" },
]

export type PickType = "spread" | "total" | "player_prop"

export interface Source {
  name: string
  url: string
}

export interface ConsensusPicksResult {
  date: string
  spreads: ConsensusPick[]
  totals: ConsensusPick[]
  playerProps: ConsensusPick[]
}

export interface HistoricalPick {
  date: string
  title: string
  pick: string
  result: "win" | "loss" | "push" | "pending"
  consensusStrength: number
}

export interface HistoricalStats {
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
  picks: HistoricalPick[]
}

export interface HistoricalResults {
  weekly: HistoricalStats
  monthly: HistoricalStats
  season: HistoricalStats
}

/**
 * Get consensus picks for a specific date
 * @param date Optional date to get picks for (defaults to today)
 * @returns Promise with consensus picks
 */
export async function getConsensusPicksForToday(date?: Date): Promise<ConsensusPicksResult> {
  const formattedDate = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")

  try {
    // Try to get picks from the database first
    const picks = await getConsensusPicksForDate(formattedDate)

    if (picks.length > 0) {
      // Group picks by type
      const spreads = picks.filter((p) => p.type === "spread")
      const totals = picks.filter((p) => p.type === "total")
      const playerProps = picks.filter((p) => p.type === "player_prop")

      return {
        date: formattedDate,
        spreads,
        totals,
        playerProps,
      }
    }

    // If no picks in database, run research
    console.log(`No picks found for ${formattedDate}, running AI research...`)
    return await researchPicksWithAI(formattedDate)
  } catch (error) {
    console.error("Error getting consensus picks:", error)
    // Return empty data on error
    return {
      date: formattedDate,
      spreads: [],
      totals: [],
      playerProps: [],
    }
  }
}

/**
 * Get mock consensus data as a fallback
 * @param date Date string
 * @returns Mock consensus data
 */
function getFallbackConsensusData(date: string): ConsensusPicksResult {
  console.log(`Using fallback data for ${date}`)
  return {
    date,
    spreads: [
      {
        id: "fallback-spread-1",
        title: "Lakers vs. Warriors",
        matchup: "Los Angeles Lakers @ Golden State Warriors",
        pick: "Warriors -3.5",
        consensus_strength: 85,
        rationale:
          "The Warriors have been dominant at home this season, winning 8 of their last 10 games at Chase Center. The Lakers are on the second night of a back-to-back and LeBron James is questionable with an ankle injury.",
        sources: [
          { name: "ESPN Betting", url: "https://www.espn.com/betting/" },
          { name: "Action Network", url: "https://www.actionnetwork.com/" },
        ],
        research_run_id: "fallback",
        pick_date: date,
        type: "spread",
        result: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    totals: [
      {
        id: "fallback-total-1",
        title: "Nuggets vs. Suns Total",
        matchup: "Denver Nuggets @ Phoenix Suns",
        pick: "Under 226.5",
        consensus_strength: 75,
        rationale:
          "Both teams have been playing at a slower pace recently. The Nuggets are focused on defense, holding opponents under 110 points in 6 of their last 8 games.",
        sources: [
          { name: "Odds Shark", url: "https://www.oddsshark.com/nba" },
          { name: "Vegas Insider", url: "https://www.vegasinsider.com/nba/odds/las-vegas/" },
        ],
        research_run_id: "fallback",
        pick_date: date,
        type: "total",
        result: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    playerProps: [
      {
        id: "fallback-prop-1",
        title: "Luka Dončić Points",
        matchup: "Dallas Mavericks vs. Minnesota Timberwolves",
        pick: "Luka Dončić Over 32.5 Points",
        consensus_strength: 90,
        rationale:
          "Dončić has exceeded this points total in 7 of his last 8 games, averaging 36.2 points during that stretch.",
        sources: [
          { name: "ESPN Betting", url: "https://www.espn.com/betting/" },
          { name: "Rotogrinders", url: "https://rotogrinders.com/sports/nba" },
        ],
        research_run_id: "fallback",
        pick_date: date,
        type: "player_prop",
        result: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  }
}

/**
 * Research picks using AI for a specific date
 * @param date Date to research in YYYY-MM-DD format
 * @returns Promise with consensus picks
 */
export async function researchPicksWithAI(date: string): Promise<ConsensusPicksResult> {
  // Always use Perplexity Sonar Pro model
  const model = getBestAvailableModel("perplexity")
  const modelName = model.toString()

  // Start timing
  const startTime = Date.now()

  // Create a research run record
  let researchRun
  try {
    researchRun = await createResearchRun(date, modelName)
  } catch (dbError) {
    console.error("Error creating research run record:", dbError)
    // If we can't even create a research run, return fallback data
    return getFallbackConsensusData(date)
  }

  try {
    // Create a detailed prompt for the AI
    const prompt = `Research NBA betting picks for ${date} from the following websites:
    ${BETTING_SITES.map((site) => `- ${site.name}: ${site.url}`).join("\n")}
    
    For each website, identify their recommended picks for:
    1. Game spreads
    2. Game over/unders (totals)
    3. Player props
    
    Then, analyze all the picks and identify consensus picks where multiple sites agree on the same bet.
    For each consensus pick, provide:
    - The matchup or player name
    - The specific bet recommendation
    - The consensus strength (percentage of sites agreeing)
    - A brief rationale for the pick
    - List of sources that agree on this pick
    
    Format the response as a JSON object with the following structure:
    {
      "date": "${date}",
      "spreads": [
        {
          "title": "Team A vs Team B",
          "matchup": "Team A @ Team B",
          "pick": "Team A -3.5",
          "consensusStrength": 75,
          "rationale": "Explanation for the pick...",
          "sources": [
            { "name": "Source Name", "url": "Source URL" }
          ]
        }
      ],
      "totals": [...],
      "playerProps": [...]
    }
    
    Only include picks with a consensus strength of 60% or higher.
    Ensure your response is valid JSON that can be parsed with JSON.parse().
    IMPORTANT: For source names, use EXACTLY the names from the list I provided above.
    IMPORTANT: Your entire response must be valid JSON. Do not include any text before or after the JSON.
    `

    // Generate text with the AI model
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.2, // Lower temperature for more factual responses
      maxTokens: 4000, // Ensure we have enough tokens for the response
    })

    // Parse the AI response
    try {
      // Try to extract JSON from the response in case the AI included extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      // Check if the response starts with "I'm unable" or similar phrases that indicate an error
      if (jsonText.trim().startsWith("I'm") || jsonText.trim().startsWith("I am")) {
        console.error("AI returned an error message instead of JSON:", jsonText)
        throw new Error("AI returned an error message instead of JSON")
      }

      let results: ConsensusPicksResult

      try {
        results = JSON.parse(jsonText) as ConsensusPicksResult
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError)
        console.error("Raw AI response:", jsonText)
        throw new Error("Failed to parse AI response")
      }

      // Validate the structure of the results
      if (!results.spreads) results.spreads = []
      if (!results.totals) results.totals = []
      if (!results.playerProps) results.playerProps = []

      // Collect all unique sources from the results
      const allSources = new Map<string, string>()

      // Process spreads
      results.spreads.forEach((pick) => {
        if (pick.sources) {
          pick.sources.forEach((source) => {
            allSources.set(source.name, source.url)
          })
        }
      })

      // Process totals
      results.totals.forEach((pick) => {
        if (pick.sources) {
          pick.sources.forEach((source) => {
            allSources.set(source.name, source.url)
          })
        }
      })

      // Process player props
      results.playerProps.forEach((pick) => {
        if (pick.sources) {
          pick.sources.forEach((source) => {
            allSources.set(source.name, source.url)
          })
        }
      })

      // Convert the map to an array of sources
      const sourcesToEnsure = Array.from(allSources.entries()).map(([name, url]) => ({ name, url }))

      // Ensure all sources exist in the database
      try {
        await ensureSourcesExist(sourcesToEnsure)
      } catch (sourceError) {
        console.error("Error ensuring sources exist:", sourceError)
        // Continue anyway - we'll handle missing sources in saveConsensusPicks
      }

      // Save results to database
      const allPicks = [
        ...results.spreads.map((p) => ({ ...p, type: "spread" as const })),
        ...results.totals.map((p) => ({ ...p, type: "total" as const })),
        ...results.playerProps.map((p) => ({ ...p, type: "player_prop" as const })),
      ]

      try {
        await saveConsensusPicks(researchRun.id, date, allPicks)

        // Update research run with results
        const endTime = Date.now()
        const duration = endTime - startTime
        await updateResearchRun(researchRun.id, "completed", allPicks.length, duration)
      } catch (dbError) {
        console.error("Error saving picks to database:", dbError)
        // Continue with the results even if saving to DB fails
      }

      return results
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", text)

      try {
        await updateResearchRun(researchRun.id, "failed", 0, Date.now() - startTime)
      } catch (dbError) {
        console.error("Error updating research run status:", dbError)
      }

      // Return fallback data
      return getFallbackConsensusData(date)
    }
  } catch (error) {
    console.error("AI research error:", error)

    try {
      await updateResearchRun(researchRun.id, "failed", 0, Date.now() - startTime)
    } catch (dbError) {
      console.error("Error updating research run status:", dbError)
    }

    // Return fallback data
    return getFallbackConsensusData(date)
  }
}

/**
 * Get historical results
 * @returns Promise with historical results
 */
export async function getHistoricalResults(): Promise<HistoricalResults> {
  const today = new Date()

  // Calculate date ranges
  const weekAgo = format(subDays(today, 7), "yyyy-MM-dd")
  const monthAgo = format(subDays(today, 30), "yyyy-MM-dd")
  const seasonStart = format(new Date(today.getFullYear(), 9, 15), "yyyy-MM-dd") // October 15th of current year
  const todayStr = format(today, "yyyy-MM-dd")

  try {
    // Get stats for each time period
    const weeklyStats = await getWinLossStats(weekAgo, todayStr)
    const monthlyStats = await getWinLossStats(monthAgo, todayStr)
    const seasonStats = await getWinLossStats(seasonStart, todayStr)

    // Get picks for each time period
    const weeklyPicks = await getHistoricalResultsFromDb(weekAgo, todayStr)
    const monthlyPicks = await getHistoricalResultsFromDb(monthAgo, todayStr)
    const seasonPicks = await getHistoricalResultsFromDb(seasonStart, todayStr)

    // Format picks for display
    const formatPicks = (picks: ConsensusPick[]): HistoricalPick[] => {
      return picks.map((p) => ({
        date: format(new Date(p.pick_date), "MMM dd, yyyy"),
        title: p.title,
        pick: p.pick,
        result: p.result,
        consensusStrength: p.consensus_strength,
      }))
    }

    return {
      weekly: {
        ...weeklyStats,
        picks: formatPicks(weeklyPicks),
      },
      monthly: {
        ...monthlyStats,
        picks: formatPicks(monthlyPicks),
      },
      season: {
        ...seasonStats,
        picks: formatPicks(seasonPicks),
      },
    }
  } catch (error) {
    console.error("Error getting historical results:", error)

    // Return empty data on error
    return {
      weekly: {
        wins: 0,
        losses: 0,
        pushes: 0,
        winPercentage: 0,
        spreadRecord: "0-0",
        spreadWinPercentage: 0,
        totalRecord: "0-0",
        totalWinPercentage: 0,
        propRecord: "0-0",
        propWinPercentage: 0,
        picks: [],
      },
      monthly: {
        wins: 0,
        losses: 0,
        pushes: 0,
        winPercentage: 0,
        spreadRecord: "0-0",
        spreadWinPercentage: 0,
        totalRecord: "0-0",
        totalWinPercentage: 0,
        propRecord: "0-0",
        propWinPercentage: 0,
        picks: [],
      },
      season: {
        wins: 0,
        losses: 0,
        pushes: 0,
        winPercentage: 0,
        spreadRecord: "0-0",
        spreadWinPercentage: 0,
        totalRecord: "0-0",
        totalWinPercentage: 0,
        propRecord: "0-0",
        propWinPercentage: 0,
        picks: [],
      },
    }
  }
}
