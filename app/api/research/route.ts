import { type NextRequest, NextResponse } from "next/server"
import { getBestAvailableModel } from "@/lib/ai-models"
import { BETTING_SITES } from "@/lib/research-service"

export async function POST(req: NextRequest) {
  try {
    const { type, date, model } = await req.json()

    if (!type || !["spreads", "totals", "props", "all"].includes(type)) {
      return NextResponse.json({ error: "Invalid research type" }, { status: 400 })
    }

    // Always use Perplexity Sonar Pro as the default model
    const aiModel = getBestAvailableModel("perplexity")

    // Create a prompt based on the type of research needed
    let prompt = ""
    const formattedDate = date || "today"

    if (type === "all") {
      prompt = `Research NBA betting picks for ${formattedDate} from the following websites:
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
        "date": "${formattedDate}",
        "picks": [
          {
            "type": "spread|total|prop",
            "matchup": "Team A @ Team B",
            "pick": "Team A -3.5",
            "consensusStrength": 75,
            "rationale": "Explanation for the pick...",
            "sources": [
              { "name": "Source Name", "url": "Source URL" }
            ]
          }
        ]
      }
      
      Only include picks with a consensus strength of 60% or higher.
      `
    } else if (type === "spreads") {
      prompt = `Research NBA game spread betting picks for ${formattedDate} from the following websites:
      ${BETTING_SITES.map((site) => `- ${site.name}: ${site.url}`).join("\n")}
      
      Identify consensus picks where multiple sites agree on the same spread bet.
      For each consensus pick, provide:
      1. The matchup
      2. The recommended spread bet
      3. The consensus strength (percentage of sites agreeing)
      4. A brief rationale for the pick
      5. List of sources that agree on this pick
      
      Format the response as a JSON object with the following structure:
      {
        "date": "${formattedDate}",
        "picks": [
          {
            "matchup": "Team A @ Team B",
            "pick": "Team A -3.5",
            "consensusStrength": 75,
            "rationale": "Explanation for the pick...",
            "sources": [
              { "name": "Source Name", "url": "Source URL" }
            ]
          }
        ]
      }
      
      Only include picks with a consensus strength of 60% or higher.
      `
    } else if (type === "totals") {
      prompt = `Research NBA game over/under total betting picks for ${formattedDate} from the following websites:
      ${BETTING_SITES.map((site) => `- ${site.name}: ${site.url}`).join("\n")}
      
      Identify consensus picks where multiple sites agree on the same over/under bet.
      For each consensus pick, provide:
      1. The matchup
      2. The recommended over/under bet
      3. The consensus strength (percentage of sites agreeing)
      4. A brief rationale for the pick
      5. List of sources that agree on this pick
      
      Format the response as a JSON object with the following structure:
      {
        "date": "${formattedDate}",
        "picks": [
          {
            "matchup": "Team A @ Team B",
            "pick": "Over/Under 225.5",
            "consensusStrength": 75,
            "rationale": "Explanation for the pick...",
            "sources": [
              { "name": "Source Name", "url": "Source URL" }
            ]
          }
        ]
      }
      
      Only include picks with a consensus strength of 60% or higher.
      `
    } else if (type === "props") {
      prompt = `Research NBA player prop betting picks for ${formattedDate} from the following websites:
      ${BETTING_SITES.map((site) => `- ${site.name}: ${site.url}`).join("\n")}
      
      Identify consensus picks where multiple sites agree on the same player prop bet.
      For each consensus pick, provide:
      1. The player name and prop type (points, rebounds, assists, etc.)
      2. The recommended over/under bet
      3. The consensus strength (percentage of sites agreeing)
      4. A brief rationale for the pick
      5. List of sources that agree on this pick
      
      Format the response as a JSON object with the following structure:
      {
        "date": "${formattedDate}",
        "picks": [
          {
            "player": "Player Name",
            "matchup": "Team A @ Team B",
            "pick": "Over/Under 25.5 Points",
            "consensusStrength": 75,
            "rationale": "Explanation for the pick...",
            "sources": [
              { "name": "Source Name", "url": "Source URL" }
            ]
          }
        ]
      }
      
      Only include picks with a consensus strength of 60% or higher.
      `
    }

    // In a production environment, you would use the AI to research the websites
    // For demo purposes, we'll return a mock response to avoid making actual API calls

    // This is how you would use the AI SDK to generate the research:
    /*
    const { text } = await generateText({
      model: aiModel,
      prompt,
      temperature: 0.2, // Lower temperature for more factual responses
    });
    
    // Parse the AI response
    let results;
    try {
      results = JSON.parse(text);
    } catch (e) {
      // If the AI doesn't return valid JSON, handle the error
      results = { error: "Failed to parse AI response", rawResponse: text };
    }
    
    return NextResponse.json(results);
    */

    // For demo purposes, return mock data
    const mockData = {
      date: date || new Date().toLocaleDateString(),
      picks: [
        {
          matchup: "Los Angeles Lakers @ Golden State Warriors",
          pick: "Warriors -3.5",
          consensusStrength: 85,
          rationale:
            "The Warriors have been dominant at home this season, winning 8 of their last 10 games at Chase Center. The Lakers are on the second night of a back-to-back and LeBron James is questionable with an ankle injury.",
          sources: [
            { name: "ESPN Betting", url: "https://www.espn.com/betting/nba/" },
            { name: "Action Network", url: "https://www.actionnetwork.com/nba/picks" },
            { name: "CBS Sports", url: "https://www.cbssports.com/nba/picks/" },
            { name: "Vegas Insider", url: "https://www.vegasinsider.com/nba/odds/las-vegas/" },
          ],
        },
      ],
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Research API error:", error)
    return NextResponse.json({ error: "Failed to process research request" }, { status: 500 })
  }
}
