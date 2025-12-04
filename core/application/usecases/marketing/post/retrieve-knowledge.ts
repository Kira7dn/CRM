/**
 * Retrieve Knowledge Use Case
 * Uses vector search to retrieve relevant past content for context
 */

import { getVectorDBService } from "@/infrastructure/adapters/vector-db"
import OpenAI from "openai"

export interface RetrieveKnowledgeRequest {
  topic: string
  limit?: number
}

export interface RetrieveKnowledgeResponse {
  context: string
  sources: Array<{
    postId: string
    title: string
    content: string
    similarity: number
  }>
}

/**
 * Retrieve Knowledge Use Case
 * Generates embeddings and searches for similar content in vector DB
 */
export class RetrieveKnowledgeUseCase {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required for RAG")
    }
    this.openai = new OpenAI({ apiKey })
  }

  async execute(request: RetrieveKnowledgeRequest): Promise<RetrieveKnowledgeResponse> {
    try {
      const vectorDB = getVectorDBService()

      // Generate embedding for topic
      const embedding = await this.generateEmbedding(request.topic)

      // Search similar content in vector DB - ONLY knowledge resources
      const results = await vectorDB.searchSimilar(embedding, {
        limit: request.limit || 5,
        scoreThreshold: 0.7,
        contentType: "knowledge_resource"  // NEW: Filter only knowledge resources
      })

      // Build context from results
      if (results.length === 0) {
        return {
          context: 'No relevant knowledge found in database.',
          sources: []
        }
      }

      const context = results.map((r, idx) => {
        const preview = r.content.length > 200 ? r.content.slice(0, 200) + '...' : r.content
        return `[${idx + 1}] ${r.metadata.title || 'Untitled'}
${preview}
(Similarity: ${(r.score * 100).toFixed(1)}%)`
      }).join('\n\n')

      return {
        context,
        sources: results.map(r => ({
          postId: r.postId,
          title: r.metadata.title || 'Untitled',
          content: r.content,
          similarity: r.score
        }))
      }
    } catch (error) {
      console.error('[RAG] Failed to retrieve knowledge:', error)
      // Fallback: return empty context
      return {
        context: '',
        sources: []
      }
    }
  }

  /**
   * Generate embedding using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float"
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('[RAG] Failed to generate embedding:', error)
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
