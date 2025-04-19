import { openai } from "@ai-sdk/openai"

// Initialize OpenAI configuration
export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not set. AI-powered summaries will fall back to basic generation.")
    return null
  }

  return {
    openai: openai,
    model: "gpt-4o",
  }
}
