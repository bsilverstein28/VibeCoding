import { openai } from "@ai-sdk/openai"

// Initialize OpenAI configuration
export function getOpenAIConfig() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.warn("OPENAI_API_KEY is not set. AI-powered summaries will fall back to basic generation.")
      return null
    }

    // Validate the API key format (simple check)
    if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
      console.warn("OPENAI_API_KEY appears to be invalid. AI-powered summaries will fall back to basic generation.")
      return null
    }

    console.log("OpenAI configuration initialized successfully")
    return {
      openai: openai,
      model: "gpt-4o",
    }
  } catch (error) {
    console.error("Error initializing OpenAI config:", error)
    return null
  }
}
