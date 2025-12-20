/**
 * Retrieve Knowledge Use Case
 * Retrieves structured knowledge chunks from vector DB
 */

import { getEmbeddingService, getVectorDBService } from "@/infrastructure/adapters/ai"
import type { EmbeddingCategory } from "@/infrastructure/adapters/ai/vector-db"

export interface RetrieveKnowledgeRequest {
  query: string
  limit?: number
  postId?: string
  productId?: number
  resourceId?: string
  minScore?: number
}

export interface RetrieveKnowledgeResponse {
  chunks: Array<{
    id: string
    title: string
    content: string
    similarity: number
    source: {
      id: string
      title?: string
    }
  }>
}

export class RetrieveKnowledgeUseCase {

  async execute(
    request: RetrieveKnowledgeRequest
  ): Promise<RetrieveKnowledgeResponse> {

    const embeddingService = getEmbeddingService()
    const vectorDB = await getVectorDBService()

    // 1️⃣ Generate embedding
    const embedding = await embeddingService.generateEmbedding(request.query)

    // 2️⃣ Build metadata filter (knowledge-centric)
    const filter = {
      embeddingCategory: "knowledge_resource" as EmbeddingCategory,
      ...(request.postId && { postId: request.postId }),
      ...(request.productId && { productId: request.productId }),
      ...(request.resourceId && { resourceId: request.resourceId }),
    }

    // 3️⃣ Vector search
    const results = await vectorDB.searchSimilar(
      embedding, {
      limit: request.limit ?? 5,
      scoreThreshold: request.minScore ?? 0.75,
      filter,
    }
    )

    // 4️⃣ Map result → domain response
    return {
      chunks: results.map((r: any) => ({
        id: r.id,
        title: r.metadata.title ?? 'Untitled',
        content: r.content,
        similarity: r.score,
        source: {
          id: r.metadata.resourceId ?? r.id,
          title: r.metadata.title,
        }
      }))
    }
  }
}
