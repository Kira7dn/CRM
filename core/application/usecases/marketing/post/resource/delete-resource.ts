/**
 * Delete Resource Use Case
 * Deletes resource from S3, DB, and VectorDB
 */

import type { ResourceService } from "@/core/application/usecases/marketing/post/resource/resource-service.interfaces"
import { createS3StorageService } from "@/infrastructure/adapters/s3-storage-service"
import { getVectorDBService } from "@/infrastructure/adapters/ai"

export interface DeleteResourceRequest {
  resourceId: string
}

export interface DeleteResourceResponse {
  success: boolean
}

/**
 * DeleteResourceUseCase
 * Orchestrates complete resource deletion from all systems
 */
export class DeleteResourceUseCase {
  constructor(private resourceService: ResourceService) { }

  async execute(request: DeleteResourceRequest): Promise<DeleteResourceResponse> {
    console.log(`[DeleteResource] Starting deletion for ${request.resourceId}`)

    // 1. Get resource from DB
    const resource = await this.resourceService.getById(request.resourceId)
    if (!resource) {
      throw new Error("Resource not found")
    }

    // 2. Delete from S3
    try {
      const s3Service = createS3StorageService()
      await s3Service.delete(resource.s3Key)
      console.log(`[DeleteResource] Deleted from S3: ${resource.s3Key}`)
    } catch (error) {
      console.warn(`[DeleteResource] Failed to delete from S3:`, error)
      // Continue with deletion even if S3 fails
    }

    // 3. Delete embeddings from VectorDB
    const vectorDB = await getVectorDBService()
    try {
      await vectorDB.deleteByResourceId(request.resourceId)
    } catch (error) {
      console.error(`[DeleteResource] Failed to delete embedding ${request.resourceId} from VectorDB:`, error)
      throw new Error(`Không thể xóa embedding từ VectorDB: ${error instanceof Error ? error.message : String(error)}`)
    }

    console.log(`[DeleteResource] Deleted ${resource.chunkCount} embeddings from VectorDB`)

    // 4. Delete from DB
    const deleted = await this.resourceService.delete(request.resourceId)
    if (!deleted) {
      throw new Error("Failed to delete resource from database")
    }

    console.log(`[DeleteResource] Successfully deleted resource: ${request.resourceId}`)

    return { success: true }
  }
}
