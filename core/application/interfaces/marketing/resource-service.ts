/**
 * Resource Service Interface
 * Defines contract for resource data operations
 */

import type { Resource } from "@/core/domain/marketing/resource"

/**
 * Resource payload for create/update operations
 * Extends from domain Resource with all fields optional
 */
export interface ResourcePayload extends Partial<Resource> {}

/**
 * Resource Service Interface
 * Abstracts resource data access operations
 */
export interface ResourceService {
  /**
   * Get all resources for a specific user
   * @param userId User ID to filter resources
   * @returns Promise resolving to array of resources
   */
  getAll(userId: string): Promise<Resource[]>

  /**
   * Get a resource by ID
   * @param id Resource ID
   * @returns Promise resolving to resource or null if not found
   */
  getById(id: string): Promise<Resource | null>

  /**
   * Create a new resource
   * @param payload Resource data
   * @returns Promise resolving to created resource
   */
  create(payload: ResourcePayload): Promise<Resource>

  /**
   * Delete a resource by ID
   * @param id Resource ID
   * @returns Promise resolving to true if deleted, false otherwise
   */
  delete(id: string): Promise<boolean>
}
