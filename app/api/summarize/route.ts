import { type NextRequest, NextResponse } from "next/server"
import { getBestAvailableModel } from "@/lib/ai-models"

export async function POST(req: NextRequest) {
  try {
    const { picks, type } = await req.json()

    if (!picks || !Array.isArray(picks) || picks.length === 0) {
      return NextResponse.json({ error: "Invalid picks data" }, { status: 400 })
    }

    // Get the best available AI model
    const model = getBestAvailableModel()

    const prompt = `Summarize the following ${type} betting picks for NBA games:
    
    ${JSON.stringify(picks, null, 2)}
    
    Provide a concise summary that highlights:
    1. The strongest consensus picks
    2. Any notable trends or patterns
    3. Key factors influencing these picks
    
    Keep the summary under 200 words and focus on the most actionable insights.`

    // In a production environment, you would use the AI to generate the summary
    // For demo purposes, we'll return a mock response to avoid making actual API calls

    // This is how you would use the AI SDK to generate the summary:
    /*
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.3, // Slightly higher temperature for more natural language
    });
    
    return NextResponse.json({ summary: text });
    */

    // For demo purposes, return mock data
    let mockSummary = ""

    if (type === "spreads") {
      mockSummary =
        "Today's strongest NBA spread consensus is Warriors -3.5 over Lakers (85% agreement), backed by Golden State's impressive 8-2 home record and the Lakers playing on a back-to-back with LeBron questionable. The Celtics -2 over Bucks (70% consensus) is also notable, with Boston's league-best record and recent 3-0 head-to-head advantage. Both picks are influenced by home court advantage, injury concerns, and recent team performance trends. The Warriors pick offers particularly strong value given the combination of rest advantage and potential star player absence."
    } else if (type === "totals") {
      mockSummary =
        "The Nuggets-Suns Under 226.5 stands out with 75% consensus across major betting sites. This pick is driven by both teams' recent slower pace of play, with Denver's defense holding 6 of their last 8 opponents under 110 points. The historical trend is compelling, with the last 4 head-to-head matchups staying under this total. Both teams rank in the bottom half of the league in pace, suggesting a methodical game flow that favors the under."
    } else if (type === "props") {
      mockSummary =
        "Luka Dončić Over 32.5 Points emerges as the strongest consensus (90%) among today's NBA player props. Dončić has exceeded this total in 7 of his last 8 games, averaging 36.2 points in that span. His recent success against Minnesota (39 and 35 points in last two meetings) further supports this pick. The Jokić triple-double prop (65% consensus) is also noteworthy, supported by his 4 triple-doubles in 7 games and Phoenix's rebounding weakness (ranked 22nd). Dončić's prop offers higher confidence due to stronger consensus and more consistent recent performance."
    } else {
      mockSummary =
        "Today's NBA betting consensus picks show strong agreement on several key wagers. The most compelling pick is Warriors -3.5 over Lakers (85% consensus) due to Golden State's home dominance and Lakers' back-to-back scheduling disadvantage. For player props, Luka Dončić Over 32.5 Points stands out with 90% consensus, supported by his recent scoring surge and strong history against Minnesota. The Nuggets-Suns Under 226.5 (75% consensus) is backed by both teams' slower recent pace and historical head-to-head trends. These picks are primarily influenced by recent performance trends, scheduling advantages, and matchup-specific factors."
    }

    return NextResponse.json({ summary: mockSummary })
  } catch (error) {
    console.error("Summarize API error:", error)
    return NextResponse.json({ error: "Failed to process summarization request" }, { status: 500 })
  }
}
