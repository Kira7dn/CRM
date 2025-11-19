/**
 * Cache Invalidation Service
 * Sprint 7 - Performance Optimization
 *
 * Provides centralized cache invalidation logic triggered by data mutations.
 */

import { getCache } from "./redis-cache";
import { CacheInvalidation } from "./cache-keys";

export class CacheInvalidator {
  private static cache = getCache();

  /**
   * Invalidate all caches (use sparingly)
   */
  static async invalidateAll(): Promise<number> {
    const patterns = CacheInvalidation.allAnalytics();
    let totalDeleted = 0;

    for (const pattern of patterns) {
      const deleted = await this.cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    console.log(`[CacheInvalidator] Invalidated ${totalDeleted} cache entries (ALL)`);
    return totalDeleted;
  }

  /**
   * Invalidate revenue-related caches
   * Called when orders are created, updated, or deleted
   */
  static async invalidateRevenue(): Promise<number> {
    const patterns = CacheInvalidation.revenue();
    let totalDeleted = 0;

    for (const pattern of patterns) {
      const deleted = await this.cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    console.log(`[CacheInvalidator] Invalidated ${totalDeleted} revenue cache entries`);
    return totalDeleted;
  }

  /**
   * Invalidate customer-related caches
   * Called when customers are created or updated
   */
  static async invalidateCustomer(): Promise<number> {
    const patterns = CacheInvalidation.customer();
    let totalDeleted = 0;

    for (const pattern of patterns) {
      const deleted = await this.cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    console.log(`[CacheInvalidator] Invalidated ${totalDeleted} customer cache entries`);
    return totalDeleted;
  }

  /**
   * Invalidate staff-related caches
   * Called when orders are assigned to staff
   */
  static async invalidateStaff(): Promise<number> {
    const patterns = CacheInvalidation.staff();
    let totalDeleted = 0;

    for (const pattern of patterns) {
      const deleted = await this.cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    console.log(`[CacheInvalidator] Invalidated ${totalDeleted} staff cache entries`);
    return totalDeleted;
  }

  /**
   * Invalidate campaign-related caches
   * Called when campaigns are updated
   */
  static async invalidateCampaign(): Promise<number> {
    const patterns = CacheInvalidation.campaign();
    let totalDeleted = 0;

    for (const pattern of patterns) {
      const deleted = await this.cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    console.log(`[CacheInvalidator] Invalidated ${totalDeleted} campaign cache entries`);
    return totalDeleted;
  }

  /**
   * Invalidate forecast caches
   * Called daily or when significant data changes occur
   */
  static async invalidateForecast(): Promise<number> {
    const patterns = CacheInvalidation.forecast();
    let totalDeleted = 0;

    for (const pattern of patterns) {
      const deleted = await this.cache.deletePattern(pattern);
      totalDeleted += deleted;
    }

    console.log(`[CacheInvalidator] Invalidated ${totalDeleted} forecast cache entries`);
    return totalDeleted;
  }

  /**
   * Smart invalidation for order mutations
   * Invalidates revenue, staff, and forecast caches
   */
  static async onOrderMutation(): Promise<void> {
    await Promise.all([
      this.invalidateRevenue(),
      this.invalidateStaff(),
      this.invalidateForecast(),
    ]);
  }

  /**
   * Smart invalidation for customer mutations
   * Invalidates customer and forecast caches
   */
  static async onCustomerMutation(): Promise<void> {
    await Promise.all([
      this.invalidateCustomer(),
      this.invalidateForecast(),
    ]);
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    connectedClients: number;
    usedMemory: string;
    totalKeys: number;
  }> {
    return await this.cache.getStats();
  }
}

/**
 * Convenience functions for common invalidation patterns
 */
export const invalidateOnOrderCreate = () => CacheInvalidator.onOrderMutation();
export const invalidateOnOrderUpdate = () => CacheInvalidator.onOrderMutation();
export const invalidateOnOrderDelete = () => CacheInvalidator.onOrderMutation();
export const invalidateOnCustomerCreate = () => CacheInvalidator.onCustomerMutation();
export const invalidateOnCustomerUpdate = () => CacheInvalidator.onCustomerMutation();
