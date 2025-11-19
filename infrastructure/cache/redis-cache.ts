/**
 * Redis Cache Service
 * Sprint 7 - Performance Optimization
 *
 * Provides caching capabilities for expensive analytics queries.
 * Uses Redis with configurable TTL and automatic serialization.
 */

import Redis from "ioredis";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 1800 = 30 minutes)
  prefix?: string; // Cache key prefix (default: "crm:")
}

export class RedisCache {
  private static instance: RedisCache;
  private redis: Redis;
  private readonly defaultTTL = 1800; // 30 minutes
  private readonly defaultPrefix = "crm:";

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on("error", (error) => {
      console.error("[RedisCache] Connection error:", error);
    });

    this.redis.on("connect", () => {
      console.log("[RedisCache] Connected successfully");
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  /**
   * Build cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const prefixToUse = prefix || this.defaultPrefix;
    return `${prefixToUse}${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const value = await this.redis.get(fullKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[RedisCache] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);

      await this.redis.setex(fullKey, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`[RedisCache] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      await this.redis.del(fullKey);
      return true;
    } catch (error) {
      console.error(`[RedisCache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(
    pattern: string,
    options: CacheOptions = {}
  ): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern, options.prefix);
      const keys = await this.redis.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`[RedisCache] Error deleting pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error(`[RedisCache] Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - returns cached value or computes and caches it
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Compute value
    const value = await factory();

    // Cache it
    await this.set(key, value, options);

    return value;
  }

  /**
   * Invalidate analytics caches
   */
  async invalidateAnalytics(): Promise<number> {
    const patterns = [
      "analytics:*",
      "revenue:*",
      "customer:*",
      "staff:*",
      "campaign:*",
      "forecast:*",
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await this.deletePattern(pattern);
      totalDeleted += deleted;
    }

    console.log(
      `[RedisCache] Invalidated ${totalDeleted} analytics cache entries`
    );
    return totalDeleted;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connectedClients: number;
    usedMemory: string;
    totalKeys: number;
  }> {
    try {
      const info = await this.redis.info();
      const lines = info.split("\r\n");

      const connectedClients =
        parseInt(
          lines
            .find((l) => l.startsWith("connected_clients:"))
            ?.split(":")[1] || "0"
        ) || 0;

      const usedMemory =
        lines.find((l) => l.startsWith("used_memory_human:"))?.split(":")[1] ||
        "N/A";

      const allKeys = await this.redis.keys("crm:*");
      const totalKeys = allKeys.length;

      return {
        connectedClients,
        usedMemory,
        totalKeys,
      };
    } catch (error) {
      console.error("[RedisCache] Error getting stats:", error);
      return {
        connectedClients: 0,
        usedMemory: "N/A",
        totalKeys: 0,
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

/**
 * Convenience function to get cache instance
 */
export function getCache(): RedisCache {
  return RedisCache.getInstance();
}
