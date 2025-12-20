/**
 * Check Content Similarity Use Case
 * Checks if content is too similar to existing content
 */

import { getEmbeddingService } from "@/infrastructure/adapters/ai"
import { getVectorDBService } from "@/infrastructure/adapters/ai"
import type { SimilarityResult } from "@/infrastructure/adapters/ai/vector-db"

export interface CheckContentSimilarityRequest {
  content: string
  title?: string
  similarityThreshold?: number // 0.0 to 1.0, default 0.8
  limit?: number // max similar content to return, default 3
  productId?: number
}

export interface CheckContentSimilarityResponse {
  isSimilar: boolean
  maxSimilarity: number
  similarContent: Array<{
    postId: string
    content: string
    title?: string
    resourceId?: string
    similarity: number
  }>
  warning?: string
}

/**
 * Use case for checking content similarity
 */
export class CheckContentSimilarityUseCase {
  async execute(request: CheckContentSimilarityRequest): Promise<CheckContentSimilarityResponse> {
    const embeddingService = getEmbeddingService()
    const vectorDB = await getVectorDBService()

    const similarityThreshold = request.similarityThreshold ?? 0.8
    const limit = request.limit ?? 3

    // Generate embedding for new content
    const textToEmbed = `${request.title || ''} ${request.content}`.trim()
    const embedding = await embeddingService.generateEmbedding(textToEmbed)

    // Search for similar content
    const similarResults: SimilarityResult[] = await vectorDB.searchSimilar(embedding, {
      limit,
      scoreThreshold: similarityThreshold * 0.8, // Lower threshold for search to get more candidates
      filter: {
        embeddingCategory: "published_post",
        ...(request.productId && {
          productId: request.productId,
        }),
      },
    })

    // Map results
    const similarContent = similarResults.map(result => ({
      postId: result.metadata.postId || '',
      content: result.content.substring(0, 200) + (result.content.length > 200 ? "..." : ""),
      title: result.metadata.title,
      resourceId: result.metadata.resourceId,
      similarity: result.score,
    }))

    const maxSimilarity = similarContent.length > 0 ? Math.max(...similarContent.map(c => c.similarity)) : 0
    const isSimilar = maxSimilarity >= similarityThreshold

    let warning: string | undefined
    if (isSimilar) {
      warning = `Content is ${(maxSimilarity * 100).toFixed(1)}% similar to existing content. Consider changing the angle, topic, or insights.`
    }

    return {
      isSimilar,
      maxSimilarity,
      similarContent,
      warning,
    }
  }
}
