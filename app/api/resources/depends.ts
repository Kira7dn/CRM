/**
 * Resource API Dependencies
 * Factory functions for creating use case instances
 */

import { ResourceRepository } from "@/infrastructure/repositories/marketing/resource-repo"
import { UploadResourceUseCase } from "@/core/application/usecases/marketing/resource/upload-resource"
import { GetResourcesUseCase } from "@/core/application/usecases/marketing/resource/get-resources"
import { DeleteResourceUseCase } from "@/core/application/usecases/marketing/resource/delete-resource"
import type { ResourceService } from "@/core/application/interfaces/marketing/resource-service"

/**
 * Get resource service instance
 */
const getResourceService = async (): Promise<ResourceService> => {
  return new ResourceRepository()
}

/**
 * Create UploadResourceUseCase instance
 */
export const uploadResourceUseCase = async () => {
  const service = await getResourceService()
  return new UploadResourceUseCase(service)
}

/**
 * Create GetResourcesUseCase instance
 */
export const getResourcesUseCase = async () => {
  const service = await getResourceService()
  return new GetResourcesUseCase(service)
}

/**
 * Create DeleteResourceUseCase instance
 */
export const deleteResourceUseCase = async () => {
  const service = await getResourceService()
  return new DeleteResourceUseCase(service)
}
