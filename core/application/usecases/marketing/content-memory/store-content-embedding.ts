/**
 * Store Content Embedding Use Case
 * Generates and stores embeddings for content in vector DB
 */

import { getEmbeddingService } from "@/infrastructure/adapters/embedding-service"
import { getVectorDBService } from "@/infrastructure/adapters/vector-db"
import type { ContentEmbedding } from "@/infrastructure/adapters/vector-db"

export interface StoreContentEmbeddingRequest {
  postId: string
  content: string
  title?: string
  platform?: string
  topic?: string
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
    const vectorDB = getVectorDBService()

    // Generate embedding for content
    const textToEmbed = `${request.title || ''} ${request.content}`.trim()
    const embedding = await embeddingService.generateEmbedding(textToEmbed)

    // Generate unique ID for this embedding
    const embeddingId = `${request.postId}_${Date.now()}`

    // Store in vector DB
    const contentEmbedding: ContentEmbedding = {
      id: embeddingId,
      postId: request.postId,
      content: request.content,
      embedding,
      metadata: {
        contentType: "draft_content",  // Mark as draft content (not published, not knowledge)
        title: request.title,
        platform: request.platform,
        topic: request.topic,
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
