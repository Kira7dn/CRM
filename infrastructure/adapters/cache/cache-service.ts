/**
 * Generic cache service interface
 * Supports TTL (Time To Live) and generic types
 */
export interface ICacheService {
  /**
   * Get cached value by key
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  get<T>(key: string): Promise<T | null>

  /**
   * Set cached value with optional TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds Time to live in seconds (optional)
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>

  /**
   * Delete cached value by key
   * @param key Cache key
   */
  delete(key: string): Promise<void>

  /**
   * Check if key exists and is not expired
   * @param key Cache key
   */
  has(key: string): Promise<boolean>

  /**
   * Clear all cached values
   */
  clear(): Promise<void>

  /**
   * Get cache statistics (hits, misses, etc.)
   */
  getStats(): CacheStats
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  size: number
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /**
   * Default TTL in seconds
   */
  defaultTTL?: number

  /**
   * Maximum number of items to store (for in-memory cache)
   */
  maxSize?: number

  /**
   * Redis connection URL (for Redis cache)
   */
  redisUrl?: string

  /**
   * Enable logging for cache operations
   */
  enableLogging?: boolean
}

/**
 * Helper function to generate cache key from object
 * Uses stable JSON stringify and hashing
 */
export function generateCacheKey(prefix: string, data: unknown): string {
  const crypto = require("crypto")

  // Normalize numbers to avoid floating-point precision issues
  const normalize = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj
    if (typeof obj === "number") {
      // Round to 2 decimal places to avoid floating-point precision issues
      return Math.round(obj * 100) / 100
    }
    if (Array.isArray(obj)) {
      return obj.map(normalize)
    }
    if (typeof obj === "object") {
      return Object.keys(obj as Record<string, unknown>)
        .sort()
        .reduce((acc, key) => {
          acc[key] = normalize((obj as Record<string, unknown>)[key])
          return acc
        }, {} as Record<string, unknown>)
    }
    return obj
  }

  // Sort object keys for stable serialization
  const serialize = (obj: unknown): string => {
    if (obj === null || obj === undefined) return "null"
    if (typeof obj !== "object") return String(obj)
    if (Array.isArray(obj)) return `[${obj.map(serialize).join(",")}]`

    const sorted = Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = (obj as Record<string, unknown>)[key]
        return acc
      }, {} as Record<string, unknown>)

    return JSON.stringify(sorted)
  }

  const normalized = normalize(data)
  const serialized = serialize(normalized)
  const hash = crypto.createHash("sha256").update(serialized).digest("hex")

  return `${prefix}:${hash}`
}
