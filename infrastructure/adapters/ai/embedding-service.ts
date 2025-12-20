/**
 * Embedding Service using OpenAI
 * Converts text to vector embeddings for semantic search
 */

import OpenAI from "openai"

/**
 * Embedding Service
 */
export class EmbeddingService {
  private client: OpenAI
  private readonly model = "text-embedding-3-small"
  private readonly dimensions = 1536

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required")
    }

    this.client = new OpenAI({ apiKey })
  }

  /**
   * Generate embedding for text content
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: text,
        dimensions: this.dimensions,
      })

      return response.data[0].embedding
    } catch (error) {
      console.error("Failed to generate embedding:", error)
      throw new Error(
        `Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: texts,
        dimensions: this.dimensions,
      })

      return response.data.map(item => item.embedding)
    } catch (error) {
      console.error("Failed to generate embeddings:", error)
      throw new Error(
        `Batch embedding generation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Embeddings must have the same length")
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
    return similarity
  }

  /**
   * Check if embedding service is configured
   */
  static isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY
  }
}
