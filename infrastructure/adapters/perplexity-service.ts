/**
 * Perplexity AI Service for online research
 * Provides real-time web search and information retrieval
 */

export interface PerplexitySearchResult {
  content: string
  citations: Array<{ url: string; title: string }>
}

/**
 * Perplexity Service class
 */
export class PerplexityService {
  private readonly apiKey: string
  private readonly baseURL = "https://api.perplexity.ai"
  private readonly defaultModel = "llama-3.1-sonar-large-128k-online"

  constructor() {
    const key = process.env.PERPLEXITY_API_KEY

    if (!key) {
      throw new Error("PERPLEXITY_API_KEY environment variable is required")
    }

    this.apiKey = key
  }

  /**
   * Search using Perplexity online model
   */
  async search(query: string): Promise<PerplexitySearchResult> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: "system",
              content: "You are a helpful research assistant. Provide accurate, well-researched information with citations."
            },
            {
              role: "user",
              content: query
            }
          ],
          return_citations: true,
          temperature: 0.2,
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Perplexity API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()

      return {
        content: data.choices[0]?.message?.content || "",
        citations: data.citations || []
      }
    } catch (error) {
      console.error("Perplexity Service Error:", error)
      throw new Error(
        `Failed to search with Perplexity: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Check if Perplexity API is configured
   */
  static isConfigured(): boolean {
    return !!process.env.PERPLEXITY_API_KEY
  }
}

/**
 * Singleton instance
 */
let perplexityServiceInstance: PerplexityService | null = null

/**
 * Get Perplexity Service instance
 */
export function getPerplexityService(): PerplexityService {
  if (!perplexityServiceInstance) {
    if (!PerplexityService.isConfigured()) {
      throw new Error(
        "Perplexity service is not configured. Please set PERPLEXITY_API_KEY environment variable."
      )
    }
    perplexityServiceInstance = new PerplexityService()
  }
  return perplexityServiceInstance
}
