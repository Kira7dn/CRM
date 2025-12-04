/**
 * Vector Database Service using Qdrant
 * Provides vector storage and similarity search for content embeddings
 */

import { QdrantClient } from "@qdrant/js-client-rest"

/**
 * Content Type for vector embeddings
 * Distinguishes between different types of content
 */
export type ContentType = "published_post" | "knowledge_resource" | "draft_content"

/**
 * Content Embedding stored in vector DB
 */
export interface ContentEmbedding {
  id: string
  postId: string // Can be postId or resourceId
  content: string
  embedding: number[]
  metadata: {
    contentType: ContentType       // NEW: Distinguish content types
    platform?: string
    topic?: string
    title?: string
    score?: number
    resourceId?: string             // NEW: Resource ID (if knowledge_resource)
    chunkIndex?: number             // NEW: Chunk index (if knowledge_resource)
    fileType?: string               // NEW: File type (if knowledge_resource)
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
    contentType?: ContentType
    platform?: string
    topic?: string
    title?: string
    resourceId?: string
    chunkIndex?: number
    fileType?: string
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
        // 🚨 MUST: Define schema, otherwise filters won't work
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "embeddingId",
          field_schema: {
            type: "keyword",
            indexed: true,
          }
        })

        console.log(`[VectorDB] Payload schema created.`)
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

      // Prepare payload with required fields
      const payload: Record<string, any> = {
        embeddingId: embedding.id,
        postId: embedding.postId,
        content: embedding.content,
        contentType: embedding.metadata.contentType,
        createdAt: embedding.createdAt.toISOString(),
      }

      // Add optional fields if they exist
      if (embedding.metadata.platform) payload.platform = embedding.metadata.platform
      if (embedding.metadata.topic) payload.topic = embedding.metadata.topic
      if (embedding.metadata.title) payload.title = embedding.metadata.title
      if (embedding.metadata.resourceId) payload.resourceId = embedding.metadata.resourceId
      if (typeof embedding.metadata.chunkIndex !== 'undefined') payload.chunkIndex = embedding.metadata.chunkIndex
      if (embedding.metadata.fileType) payload.fileType = embedding.metadata.fileType

      // Ensure we're not sending null/undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key]
        }
      })

      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: pointId,
            vector: embedding.embedding,
            payload,
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
      contentType?: ContentType | ContentType[]  // NEW: Filter by content type
      filter?: Record<string, any>
    } = {}
  ): Promise<SimilarityResult[]> {
    await this.initializeCollection()

    const { limit = 5, scoreThreshold = 0.7, contentType, filter } = options

    // Build filter with contentType
    let qdrantFilter = filter
    if (contentType) {
      const types = Array.isArray(contentType) ? contentType : [contentType]
      qdrantFilter = {
        ...filter,
        must: [
          ...(filter?.must || []),
          {
            key: "contentType",
            match: { any: types }
          }
        ]
      }
    }

    try {
      const results = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit,
        score_threshold: scoreThreshold,
        filter: qdrantFilter,
        with_payload: true,
      })

      return results.map(result => ({
        id: String(result.id),
        postId: result.payload?.postId as string,
        content: result.payload?.content as string,
        score: result.score,
        metadata: {
          contentType: result.payload?.contentType as ContentType,
          platform: result.payload?.platform as string,
          topic: result.payload?.topic as string,
          title: result.payload?.title as string,
          resourceId: result.payload?.resourceId as string,
          chunkIndex: result.payload?.chunkIndex as number,
          fileType: result.payload?.fileType as string,
        },
      }))
    } catch (error) {
      console.error("Failed to search similar content:", error)
      throw new Error(`Similarity search failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
 * Delete embedding by its resourceId (stored in Qdrant payload)
 */
  async deleteEmbedding(resourceId: string): Promise<void> {
    if (!resourceId || typeof resourceId !== "string") {
      throw new Error("deleteEmbedding() requires a valid resourceId string")
    }

    await this.initializeCollection()
    // 🚨 MUST: Define schema, otherwise filters won't work
    // await this.client.createPayloadIndex(this.collectionName, {
    //   field_name: "resourceId",
    //   field_schema: {
    //     type: "keyword",
    //     indexed: true,
    //   }
    // })

    // Qdrant Cloud requires full filter schema structure
    const filter = {
      must: [
        {
          key: "resourceId",
          match: {
            value: resourceId,
          },
        },
      ],
    }

    try {
      console.log("[VectorDB] Deleting embedding with filter:", JSON.stringify(filter))
      const response = await this.client.delete(this.collectionName, {
        filter,
      });

      console.log(`[VectorDB] Successfully deleted embedding ${resourceId}`, response)

    } catch (error: any) {
      const errorMessage = error?.response?.data || error?.message || String(error)
      console.error(`[VectorDB] Failed to delete embedding ${resourceId}:`, errorMessage)

      throw new Error(`Failed to delete embedding: ${errorMessage}`)
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
