/**
 * Vector Database Service using Qdrant
 * Provides vector storage and similarity search for content embeddings
 */

import { QdrantClient } from "@qdrant/js-client-rest"

/**
 * Content Embedding stored in vector DB
 */
export interface ContentEmbedding {
  id: string
  postId: string
  content: string
  embedding: number[]
  metadata: {
    platform?: string
    topic?: string
    title?: string
    score?: number
  }
  createdAt: Date
}

/**
 * Similarity search result
 */
export interface SimilarityResult {
  id: string
  postId: string
  content: string
  score: number
  metadata: {
    platform?: string
    topic?: string
    title?: string
  }
}

/**
 * Vector Database Service
 */
export class VectorDBService {
  private client: QdrantClient
  private readonly collectionName = "content_embeddings"
  private readonly vectorSize = 1536 // OpenAI text-embedding-3-small dimension

  constructor() {
    const url = process.env.QDRANT_URL
    const apiKey = process.env.QDRANT_API_KEY

    if (!url || !apiKey) {
      throw new Error("QDRANT_URL and QDRANT_API_KEY environment variables are required")
    }

    this.client = new QdrantClient({
      url,
      apiKey,
    })
  }

  /**
   * Initialize collection (create if not exists)
   */
  async initializeCollection(): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections()
      const exists = collections.collections.some(c => c.name === this.collectionName)

      if (!exists) {
        // Create collection
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: "Cosine",
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 1,
        })

        console.log(`Created Qdrant collection: ${this.collectionName}`)
      }
    } catch (error) {
      console.error("Failed to initialize Qdrant collection:", error)
      throw new Error(`Vector DB initialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Store content embedding
   */
  async storeEmbedding(embedding: ContentEmbedding): Promise<void> {
    await this.initializeCollection()

    try {
      // Generate UUID v4 for Qdrant point id
      const pointId = this.generateUUID()

      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: pointId,
            vector: embedding.embedding,
            payload: {
              embeddingId: embedding.id, // Store original ID in payload
              postId: embedding.postId,
              content: embedding.content,
              platform: embedding.metadata.platform || null,
              topic: embedding.metadata.topic || null,
              title: embedding.metadata.title || null,
              createdAt: embedding.createdAt.toISOString(),
            },
          },
        ],
      })

      console.log('[VectorDB] Stored embedding:', { pointId, postId: embedding.postId })
    } catch (error) {
      console.error("[VectorDB] Failed to store embedding:", error)
      throw new Error(`Failed to store embedding: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate UUID v4 (simple implementation)
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * Search for similar content
   * Returns content with similarity score > threshold
   */
  async searchSimilar(
    queryEmbedding: number[],
    options: {
      limit?: number
      scoreThreshold?: number
      filter?: Record<string, any>
    } = {}
  ): Promise<SimilarityResult[]> {
    await this.initializeCollection()

    const { limit = 5, scoreThreshold = 0.7, filter } = options

    try {
      const results = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit,
        score_threshold: scoreThreshold,
        filter,
        with_payload: true,
      })

      return results.map(result => ({
        id: String(result.id),
        postId: result.payload?.postId as string,
        content: result.payload?.content as string,
        score: result.score,
        metadata: {
          platform: result.payload?.platform as string,
          topic: result.payload?.topic as string,
          title: result.payload?.title as string,
        },
      }))
    } catch (error) {
      console.error("Failed to search similar content:", error)
      throw new Error(`Similarity search failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Delete embedding by ID (searches by embeddingId in payload)
   */
  async deleteEmbedding(embeddingId: string): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        filter: {
          must: [
            {
              key: "embeddingId",
              match: { value: embeddingId },
            },
          ],
        },
      })
      console.log('[VectorDB] Deleted embedding:', embeddingId)
    } catch (error) {
      console.error("[VectorDB] Failed to delete embedding:", error)
      throw new Error(`Failed to delete embedding: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Delete all embeddings for a post
   */
  async deletePostEmbeddings(postId: string): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        filter: {
          must: [
            {
              key: "postId",
              match: { value: postId },
            },
          ],
        },
      })
    } catch (error) {
      console.error("Failed to delete post embeddings:", error)
      throw new Error(`Failed to delete post embeddings: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Check if Vector DB is configured
   */
  static isConfigured(): boolean {
    return !!process.env.QDRANT_URL && !!process.env.QDRANT_API_KEY
  }
}

/**
 * Singleton instance
 */
let vectorDBInstance: VectorDBService | null = null

/**
 * Get Vector DB Service instance
 */
export function getVectorDBService(): VectorDBService {
  if (!vectorDBInstance) {
    if (!VectorDBService.isConfigured()) {
      throw new Error(
        "Vector DB is not configured. Please set QDRANT_URL and QDRANT_API_KEY environment variables."
      )
    }
    vectorDBInstance = new VectorDBService()
  }
  return vectorDBInstance
}
