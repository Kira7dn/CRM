import type { ICacheService, CacheStats, CacheConfig } from "./cache-service"
import type { RedisClientType } from "redis"

/**
 * Redis cache service implementation
 * Uses Redis for distributed caching in production
 */
export class RedisCacheService implements ICacheService {
  private client: RedisClientType | null = null
  private stats: { hits: number; misses: number }
  private config: CacheConfig
  private isConnected: boolean = false

  constructor(config: CacheConfig = {}) {
    this.stats = { hits: 0, misses: 0 }
    this.config = {
      defaultTTL: config.defaultTTL || 300, // 5 minutes default
      redisUrl: config.redisUrl || process.env.REDIS_URL,
      enableLogging: config.enableLogging || false,
    }
  }

  /**
   * Initialize Redis connection
   * Lazy initialization - only connects when needed
   */
  private async ensureConnected(): Promise<boolean> {
    if (this.isConnected && this.client) {
      return true
    }

    if (!this.config.redisUrl) {
      this.log("Redis URL not configured, skipping connection")
      return false
    }

    try {
      // Dynamically import redis to avoid bundling issues
      const { createClient } = await import("redis")

      this.client = createClient({
        url: this.config.redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              this.log("Redis reconnection failed after 3 retries")
              return new Error("Redis reconnection failed")
            }
            return Math.min(retries * 100, 3000)
          },
        },
      }) as RedisClientType

      this.client.on("error", (err) => {
        this.log(`Redis error: ${err.message}`)
        this.isConnected = false
      })

      this.client.on("connect", () => {
        this.log("Redis connected successfully")
        this.isConnected = true
      })

      this.client.on("disconnect", () => {
        this.log("Redis disconnected")
        this.isConnected = false
      })

      await this.client.connect()
      this.isConnected = true
      return true
    } catch (error) {
      this.log(`Failed to connect to Redis: ${error}`)
      this.isConnected = false
      return false
    }
  }

  /**
   * Get cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    const connected = await this.ensureConnected()
    if (!connected || !this.client) {
      this.stats.misses++
      return null
    }

    try {
      const value = await this.client.get(key)

      if (!value) {
        this.stats.misses++
        this.log(`MISS: ${key}`)
        return null
      }

      this.stats.hits++
      this.log(`HIT: ${key}`)
      return JSON.parse(value) as T
    } catch (error) {
      this.log(`GET error for key ${key}: ${error}`)
      this.stats.misses++
      return null
    }
  }

  /**
   * Set cached value with optional TTL
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const connected = await this.ensureConnected()
    if (!connected || !this.client) {
      this.log(`Cannot set ${key}: Redis not connected`)
      return
    }

    try {
      const serialized = JSON.stringify(value)
      const ttl = ttlSeconds || this.config.defaultTTL || 300

      await this.client.setEx(key, ttl, serialized)
      this.log(`SET: ${key} (TTL: ${ttl}s)`)
    } catch (error) {
      this.log(`SET error for key ${key}: ${error}`)
    }
  }

  /**
   * Delete cached value by key
   */
  async delete(key: string): Promise<void> {
    const connected = await this.ensureConnected()
    if (!connected || !this.client) {
      return
    }

    try {
      await this.client.del(key)
      this.log(`DELETE: ${key}`)
    } catch (error) {
      this.log(`DELETE error for key ${key}: ${error}`)
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const connected = await this.ensureConnected()
    if (!connected || !this.client) {
      return false
    }

    try {
      const exists = await this.client.exists(key)
      return exists === 1
    } catch (error) {
      this.log(`HAS error for key ${key}: ${error}`)
      return false
    }
  }

  /**
   * Clear all cached values
   * WARNING: This clears the entire Redis database
   */
  async clear(): Promise<void> {
    const connected = await this.ensureConnected()
    if (!connected || !this.client) {
      return
    }

    try {
      await this.client.flushDb()
      this.stats = { hits: 0, misses: 0 }
      this.log("CLEAR: All cache cleared")
    } catch (error) {
      this.log(`CLEAR error: ${error}`)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? this.stats.hits / total : 0

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      size: 0, // Redis doesn't easily provide size, would need separate tracking
    }
  }

  /**
   * Disconnect from Redis
   * Should be called on application shutdown
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit()
        this.log("Redis disconnected successfully")
      } catch (error) {
        this.log(`Disconnect error: ${error}`)
      } finally {
        this.isConnected = false
        this.client = null
      }
    }
  }

  /**
   * Log cache operations if enabled
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[RedisCache] ${message}`)
    }
  }
}
