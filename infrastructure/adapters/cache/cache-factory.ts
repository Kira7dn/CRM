import type { ICacheService, CacheConfig } from "./cache-service"
import { RedisCacheService } from "./redis-cache-service"
import { InMemoryCacheService } from "./in-memory-cache-service"

/**
 * Cache service factory
 * Automatically selects Redis or in-memory cache based on configuration
 */
export class CacheFactory {
  private static instance: ICacheService | null = null

  /**
   * Get singleton cache service instance
   * Tries Redis first, falls back to in-memory cache
   */
  static async getInstance(config: CacheConfig = {}): Promise<ICacheService> {
    if (this.instance) {
      return this.instance
    }

    // Try Redis if URL is configured
    if (config.redisUrl || process.env.REDIS_URL) {
      const redisCache = new RedisCacheService(config)

      // Test connection
      try {
        await redisCache.set("__test__", "test", 10)
        const testValue = await redisCache.get("__test__")

        if (testValue === "test") {
          await redisCache.delete("__test__")
          console.log("[CacheFactory] Using Redis cache")
          this.instance = redisCache
          return this.instance
        }
      } catch (error) {
        console.warn("[CacheFactory] Redis connection failed, falling back to in-memory cache:", error)
      }
    }

    // Fallback to in-memory cache
    console.log("[CacheFactory] Using in-memory cache")
    this.instance = new InMemoryCacheService(config)
    return this.instance
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null
  }

  /**
   * Create a new cache instance without singleton
   */
  static async create(config: CacheConfig = {}): Promise<ICacheService> {
    // Try Redis if URL is configured
    if (config.redisUrl || process.env.REDIS_URL) {
      const redisCache = new RedisCacheService(config)

      try {
        await redisCache.set("__test__", "test", 10)
        const testValue = await redisCache.get("__test__")

        if (testValue === "test") {
          await redisCache.delete("__test__")
          return redisCache
        }
      } catch (error) {
        console.warn("[CacheFactory] Redis connection failed, falling back to in-memory cache:", error)
      }
    }

    // Fallback to in-memory cache
    return new InMemoryCacheService(config)
  }
}
