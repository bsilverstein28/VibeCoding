import { openai } from "@ai-sdk/openai"
import { deepinfra } from "@ai-sdk/deepinfra"
import { google } from "@ai-sdk/google"
import type { AIModel } from "ai"

/**
 * Get the best available AI model based on environment variables
 * @param preferredProvider Optional preferred provider to use if available
 * @returns The best available AI model
 */
export function getBestAvailableModel(preferredProvider?: "openai" | "deepseek" | "gemini"): AIModel {
  // Check for preferred provider first
  if (preferredProvider === "openai" && process.env.OPENAI_API_KEY) {
    return openai("gpt-4o")
  } else if (preferredProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
    return deepinfra("deepseek-ai/DeepSeek-R1-Distill-Llama-70B")
  } else if (preferredProvider === "gemini" && process.env.GEMINI_API_KEY) {
    return google("gemini-1.5-pro")
  }

  // Fall back to any available model
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o")
  } else if (process.env.GEMINI_API_KEY) {
    return google("gemini-1.5-pro")
  } else if (process.env.DEEPSEEK_API_KEY) {
    return deepinfra("deepseek-ai/DeepSeek-R1-Distill-Llama-70B")
  }

  // If no API keys are available, throw an error
  throw new Error("No AI model API keys available. Please add at least one API key to your environment variables.")
}

/**
 * Get all available AI models based on environment variables
 * @returns Array of available AI models with their names
 */
export function getAvailableModels(): { name: string; provider: string; model: AIModel }[] {
  const models = []

  if (process.env.OPENAI_API_KEY) {
    models.push({
      name: "GPT-4o",
      provider: "OpenAI",
      model: openai("gpt-4o"),
    })
  }

  if (process.env.GEMINI_API_KEY) {
    models.push({
      name: "Gemini 1.5 Pro",
      provider: "Google",
      model: google("gemini-1.5-pro"),
    })
  }

  if (process.env.DEEPSEEK_API_KEY) {
    models.push({
      name: "DeepSeek R1",
      provider: "DeepInfra",
      model: deepinfra("deepseek-ai/DeepSeek-R1-Distill-Llama-70B"),
    })
  }

  return models
}
