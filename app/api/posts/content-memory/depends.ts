/**
 * Content Memory Dependencies Factory
 * Creates use case instances for content similarity and embedding storage
 */

import { StoreContentEmbeddingUseCase } from "@/core/application/usecases/marketing/post/content-memory/store-content-embedding"
import { CheckContentSimilarityUseCase } from "@/core/application/usecases/marketing/post/content-memory/check-content-similarity"

/**
 * Create StoreContentEmbeddingUseCase instance
 */
export const createStoreContentEmbeddingUseCase = async () => {
  return new StoreContentEmbeddingUseCase()
}

/**
 * Create CheckContentSimilarityUseCase instance
 */
export const createCheckContentSimilarityUseCase = async () => {
  return new CheckContentSimilarityUseCase()
}
