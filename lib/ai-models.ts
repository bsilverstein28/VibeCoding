import { openai } from "@ai-sdk/openai"
import { deepinfra } from "@ai-sdk/deepinfra"
import { google } from "@ai-sdk/google"
import type { AIModel } from "ai"

// Custom Perplexity AI sonar-pro model integration
const perplexitySonarPro = (): AIModel => {
  return {
    id: `perplexity/sonar-pro`,
    name: `Perplexity Sonar Pro`,
    toString: () => `Perplexity Sonar Pro`,
    provider: "perplexity",
    streamable: true,
    requestOptions: async () => {
      if (!process.env.SONAR_API_KEY) {
        throw new Error("SONAR_API_KEY environment variable is not set")
      }
      return {
        url: "https://api.perplexity.ai/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
        },
      }
    },
    prepareRequest: async (request) => {
      // Convert AI SDK format to Perplexity API format
      const messages = []

      // Handle system message if present
      if (request.body.system) {
        messages.push({
          role: "system",
          content: request.body.system,
        })
      }

      // Add user message (prompt)
      messages.push({
        role: "user",
        content: request.body.prompt,
      })

      return {
        ...request,
        body: JSON.stringify({
          model: "sonar-pro",
          messages: messages,
          max_tokens: request.body.max_tokens || 1000,
          temperature: request.body.temperature || 0.7,
          stream: request.body.stream || false,
        }),
      }
    },
    extractResponse: async (response) => {
      const data = await response.json()
      return {
        text: data.choices?.[0]?.message?.content || "",
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        finishReason: data.choices?.[0]?.finish_reason || "stop",
      }
    },
  }
}

/**
 * Get the best available AI model based on environment variables
 * @param preferredProvider Optional preferred provider to use if available
 * @returns The best available AI model
 */
export function getBestAvailableModel(
  preferredProvider?: "openai" | "deepseek" | "gemini" | "sonar" | "perplexity",
): AIModel {
  // Always default to Perplexity Sonar Pro if the API key is available
  if (process.env.SONAR_API_KEY) {
    return perplexitySonarPro()
  }

  // Check for preferred provider as fallback
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

  if (process.env.SONAR_API_KEY) {
    models.push({
      name: "Perplexity Sonar Pro",
      provider: "Perplexity AI",
      model: perplexitySonarPro(),
    })
  }

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
