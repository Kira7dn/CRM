import { openai } from "@ai-sdk/openai"

/**
 * AI Configuration for OpenAI integration
 */
export const aiConfig = {
  model: openai("gpt-4o-mini"), // Fast and cost-effective for business analytics
  temperature: 0.2, // Low temperature for more deterministic predictions
  maxTokens: 2000,
}

/**
 * Get OpenAI API key from environment
 */
export function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured in environment variables")
  }
  return key
}

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.ENABLE_AI_FEATURES !== "false"
}
