/**
 * Store Content Embedding Use Case
 * Generates and stores embeddings for content in vector DB
 */

import { getEmbeddingService } from "@/infrastructure/adapters/ai"
import { getVectorDBService } from "@/infrastructure/adapters/ai"
import { ContentEmbedding, EmbeddingCategory } from "@/infrastructure/adapters/ai/vector-db"

export interface StoreContentEmbeddingRequest {
  embeddingCategory: EmbeddingCategory
  postId?: string
  productId?: number
  resourceId?: string
  content: string
  title?: string
  chunkIndex?: number
}

export interface StoreContentEmbeddingResponse {
  success: boolean
  embeddingId: string
}

/**
 * Use case for storing content embeddings
 */
export class StoreContentEmbeddingUseCase {
  async execute(request: StoreContentEmbeddingRequest): Promise<StoreContentEmbeddingResponse> {
    const embeddingService = getEmbeddingService()
    const vectorDB = await getVectorDBService()

    // Generate embedding for content
    const textToEmbed = `${request.title || ''} ${request.content}`.trim()
    const embedding = await embeddingService.generateEmbedding(textToEmbed)

    // Generate unique ID for this embedding
    const embeddingId = `${request.postId}_${Date.now()}`

    // Store in vector DB
    const contentEmbedding: ContentEmbedding = {
      id: embeddingId,
      content: request.content,
      embedding,
      metadata: {
        embeddingCategory: request.embeddingCategory,
        postId: request.postId,
        productId: request.productId,
        resourceId: request.resourceId,
        title: request.title,
        chunkIndex: request.chunkIndex,
      },
      createdAt: new Date(),
    }

    await vectorDB.storeEmbedding(contentEmbedding)

    return {
      success: true,
      embeddingId,
    }
  }
}
