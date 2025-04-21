import { streamText, tool } from "ai"
import { getBestAvailableModel } from "./ai-models"
import { z } from "zod"

/**
 * Web search tool for the AI agent
 */
export const webSearch = tool({
  description: "Search the web for up-to-date information about NBA betting picks",
  parameters: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  execute: async ({ query }) => {
    // In a real implementation, you would use a search API like Exa, Serper, or Google
    // For demo purposes, we'll return mock data

    console.log(`Searching for: ${query}`)

    // Simulate a delay for the search
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return mock search results
    return [
      {
        title: "NBA Picks Today: Expert Predictions for Lakers vs. Warriors",
        url: "https://www.espn.com/betting/nba/picks/lakers-warriors",
        snippet:
          "Our experts are backing the Warriors -3.5 at home against the Lakers tonight. Golden State has been dominant at Chase Center, winning 8 of their last 10 home games.",
        publishedDate: "2025-04-20",
      },
      {
        title: "NBA Player Props: Best Bets for Tonight's Games",
        url: "https://www.actionnetwork.com/nba/player-props",
        snippet:
          "Luka Dončić over 32.5 points is our top player prop for tonight. He's exceeded this total in 7 of his last 8 games, averaging 36.2 points during that stretch.",
        publishedDate: "2025-04-20",
      },
      {
        title: "NBA Betting: Nuggets vs. Suns Total Analysis",
        url: "https://www.covers.com/nba/nuggets-suns-prediction",
        snippet:
          "We're recommending the under 226.5 for tonight's Nuggets-Suns matchup. Both teams have been playing at a slower pace recently, and the last 4 meetings have gone under this total.",
        publishedDate: "2025-04-20",
      },
    ]
  },
})

/**
 * Research NBA betting picks using web search
 * @param date Date to research in YYYY-MM-DD format
 * @param pickType Type of picks to research (spreads, totals, props)
 * @returns Promise with research results
 */
export async function researchPicksWithWebSearch(date: string, pickType: string) {
  const model = getBestAvailableModel()

  const prompt = `You are a sports betting research assistant. Your task is to research NBA betting picks for ${date}.
  
  Focus on finding consensus ${pickType} picks where multiple betting experts agree.
  
  Use the web search tool to find information from reputable betting sites.
  
  For each consensus pick you identify, provide:
  1. The matchup or player name
  2. The specific bet recommendation
  3. The consensus strength (percentage of sources agreeing)
  4. A brief rationale for the pick
  5. List of sources that agree on this pick
  
  Format your final response as a JSON object.`

  const result = await streamText({
    model,
    prompt,
    tools: {
      webSearch,
    },
    maxSteps: 5, // Allow multiple search steps
  })

  return result.text
}
