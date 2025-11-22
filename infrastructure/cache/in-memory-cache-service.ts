import type { ICacheService, CacheStats, CacheConfig } from "./cache-service"

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  value: T
  expiresAt: number | null
}

/**
 * In-memory cache service implementation
 * Uses Map with automatic TTL expiration
 * Falls back when Redis is unavailable
 */
export class InMemoryCacheService implements ICacheService {
  private cache: Map<string, CacheEntry<unknown>>
  private stats: { hits: number; misses: number }
  private config: CacheConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: CacheConfig = {}) {
    this.cache = new Map()
    this.stats = { hits: 0, misses: 0 }
    this.config = {
      defaultTTL: config.defaultTTL || 300, // 5 minutes default
      maxSize: config.maxSize || 1000,
      enableLogging: config.enableLogging || false,
    }

    // Start cleanup interval to remove expired entries
    this.startCleanup()
  }

  /**
   * Get cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      this.stats.misses++
      this.log(`MISS: ${key}`)
      return null
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.stats.misses++
      this.log(`MISS (expired): ${key}`)
      return null
    }

    this.stats.hits++
    this.log(`HIT: ${key}`)
    return entry.value
  }

  /**
   * Set cached value with optional TTL
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= (this.config.maxSize || 1000) && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
        this.log(`EVICTED (LRU): ${firstKey}`)
      }
    }

    const ttl = ttlSeconds || this.config.defaultTTL || 300
    const expiresAt = Date.now() + ttl * 1000

    this.cache.set(key, {
      value,
      expiresAt,
    })

    this.log(`SET: ${key} (TTL: ${ttl}s)`)
  }

  /**
   * Delete cached value by key
   */
  async delete(key: string): Promise<void> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.log(`DELETE: ${key}`)
    }
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Clear all cached values
   */
  async clear(): Promise<void> {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
    this.log("CLEAR: All cache cleared")
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
      size: this.cache.size,
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired()
    }, 60000)

    // Ensure cleanup stops when process exits
    if (typeof process !== "undefined") {
      process.on("beforeExit", () => this.stopCleanup())
    }
  }

  /**
   * Stop cleanup interval
   */
  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Remove expired entries from cache
   */
  private cleanupExpired(): void {
    const now = Date.now()
    let expiredCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key)
        expiredCount++
      }
    }

    if (expiredCount > 0) {
      this.log(`CLEANUP: Removed ${expiredCount} expired entries`)
    }
  }

  /**
   * Log cache operations if enabled
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[InMemoryCache] ${message}`)
    }
  }
}
