import { EmbeddingService } from "./embedding-service"
import { VectorDBService } from "./vector-db"


/**
 * Singleton instance
 */
let embeddingServiceInstance: EmbeddingService | null = null
let vectorDBInstance: VectorDBService | null = null
let initializing: Promise<VectorDBService> | null = null

export async function getVectorDBService(): Promise<VectorDBService> {
  if (vectorDBInstance) {
    return vectorDBInstance
  }

  if (!initializing) {
    initializing = (async () => {
      const service = new VectorDBService()
      await service.bootstrap()
      vectorDBInstance = service
      return service
    })()
  }

  return initializing
}



/**
 * Get Embedding Service instance
 */
export function getEmbeddingService(): EmbeddingService {
  if (!embeddingServiceInstance) {
    if (!EmbeddingService.isConfigured()) {
      throw new Error(
        "Embedding Service is not configured. Please set OPENAI_API_KEY environment variable."
      )
    }
    embeddingServiceInstance = new EmbeddingService()
  }
  return embeddingServiceInstance
}