# AI Cache System Documentation

## Overview

The AI Cache System provides intelligent caching for expensive AI API calls in the CRM application. It supports both Redis (for production) and in-memory caching (for development/fallback), with automatic selection and graceful degradation.

## Architecture

```
┌─────────────────┐
│   AI Services   │ (RiskAssessment, RevenueForecast)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CacheFactory   │ (Auto-selects cache implementation)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ Redis  │ │ InMemory │
└────────┘ └──────────┘
```

## Components

### 1. ICacheService Interface

Generic cache interface that all implementations must follow:

```typescript
interface ICacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  has(key: string): Promise<boolean>
  clear(): Promise<void>
  getStats(): CacheStats
}
```

### 2. RedisCacheService

Production-ready Redis cache implementation.

**Features:**
- Lazy connection (connects only when needed)
- Automatic reconnection (max 3 retries)
- Graceful error handling
- JSON serialization for complex objects
- TTL support via Redis SETEX

**Usage:**
```typescript
import { RedisCacheService } from "@/infrastructure/cache"

const cache = new RedisCacheService({
  redisUrl: process.env.REDIS_URL,
  defaultTTL: 300,
  enableLogging: true
})

await cache.set("key", { data: "value" }, 600)
const value = await cache.get("key")
```

### 3. InMemoryCacheService

Fallback in-memory cache implementation.

**Features:**
- Map-based storage
- Automatic TTL expiration
- LRU eviction when maxSize reached
- Periodic cleanup (every 60 seconds)
- Statistics tracking

**Usage:**
```typescript
import { InMemoryCacheService } from "@/infrastructure/cache"

const cache = new InMemoryCacheService({
  defaultTTL: 300,
  maxSize: 1000,
  enableLogging: true
})

await cache.set("key", { data: "value" })
const value = await cache.get("key")
```

### 4. CacheFactory

Factory for automatic cache selection and singleton management.

**Usage:**
```typescript
import { CacheFactory } from "@/infrastructure/cache"

// Get singleton instance (tries Redis first, falls back to in-memory)
const cache = await CacheFactory.getInstance({
  defaultTTL: 300,
  enableLogging: process.env.NODE_ENV === "development"
})

// Create new instance without singleton
const newCache = await CacheFactory.create({ defaultTTL: 600 })
```

### 5. generateCacheKey Helper

Generates consistent cache keys from objects.

**Features:**
- Stable JSON serialization (sorted keys)
- SHA-256 hashing
- Prefix support for namespacing

**Usage:**
```typescript
import { generateCacheKey } from "@/infrastructure/cache"

const key = generateCacheKey("risk-assessment", metrics)
// Output: "risk-assessment:a3f2b9e..."
```

## Integration Examples

### Risk Assessment Service

```typescript
import { CacheFactory, generateCacheKey } from "@/infrastructure/cache"

async assessRisks(metrics: BusinessMetrics): Promise<RiskAssessment> {
  const cacheKey = generateCacheKey("risk-assessment", metrics)
  const cache = await CacheFactory.getInstance({ defaultTTL: 300 })

  // Check cache
  const cached = await cache.get<RiskAssessment>(cacheKey)
  if (cached) {
    console.log("[RiskAssessment] Cache hit")
    return cached
  }

  // Generate new assessment
  const result = await generateObject(...)

  // Cache result
  await cache.set(cacheKey, result.object, 300)

  return result.object
}
```

### Revenue Forecast Service

```typescript
import { CacheFactory, generateCacheKey } from "@/infrastructure/cache"

async generateForecast(data: RevenueDataPoint[]): Promise<RevenueForecast> {
  const cacheKey = generateCacheKey("revenue-forecast", data)
  const cache = await CacheFactory.getInstance({ defaultTTL: 1800 })

  const cached = await cache.get<RevenueForecast>(cacheKey)
  if (cached) return cached

  const result = await generateObject(...)
  await cache.set(cacheKey, result.object, 1800)

  return result.object
}
```

## Configuration

### Environment Variables

```bash
# Redis Configuration (optional, falls back to in-memory if not set)
REDIS_URL=redis://username:password@host:port

# Node Environment (affects logging)
NODE_ENV=development  # Enables cache logging
NODE_ENV=production   # Disables cache logging
```

### TTL Recommendations

| Service | TTL | Reason |
|---------|-----|--------|
| Risk Assessment | 300s (5 min) | Business metrics change frequently |
| Revenue Forecast | 1800s (30 min) | Historical data changes slowly |
| Custom | Variable | Based on data volatility |

## Cache Invalidation

### Automatic Invalidation

TTL-based expiration handles most cases:
- Expired entries are automatically removed
- InMemory: Cleanup runs every 60 seconds
- Redis: Built-in expiration

### Manual Invalidation

For immediate invalidation (e.g., after data updates):

```typescript
import { CacheFactory, generateCacheKey } from "@/infrastructure/cache"

// Clear specific entry
const cache = await CacheFactory.getInstance()
const key = generateCacheKey("risk-assessment", metrics)
await cache.delete(key)

// Clear all cache (use with caution)
await cache.clear()
```

### Invalidation Strategies

1. **Time-based (Current)**: Cache expires after TTL
2. **Event-based (Future)**: Invalidate on data changes
   ```typescript
   // After order update
   await cache.delete(generateCacheKey("risk-assessment", ...))
   ```
3. **Tag-based (Future)**: Group related cache entries
   ```typescript
   await cache.deleteByTag("dashboard-metrics")
   ```

## Monitoring

### Cache Statistics

```typescript
const cache = await CacheFactory.getInstance()
const stats = cache.getStats()

console.log(stats)
// {
//   hits: 150,
//   misses: 50,
//   hitRate: 0.75,
//   size: 42
// }
```

### Logging

Enable logging for debugging:

```typescript
const cache = await CacheFactory.getInstance({
  enableLogging: true
})

// Logs:
// [InMemoryCache] HIT: risk-assessment:a3f2b9e...
// [InMemoryCache] MISS: revenue-forecast:7e4d2a1...
// [InMemoryCache] SET: risk-assessment:a3f2b9e... (TTL: 300s)
```

## Performance Impact

### Expected Benefits

- **API Call Reduction**: 70-90% for repeated requests
- **Response Time**: 10-50ms (cached) vs 2-5s (AI API)
- **Cost Savings**: Reduced AI API usage
- **User Experience**: Faster dashboard loads

### Trade-offs

- **Memory Usage**: ~1-10MB for in-memory cache
- **Data Freshness**: Data may be stale within TTL window
- **Complexity**: Additional infrastructure component

## Testing

### Unit Tests

```typescript
import { InMemoryCacheService } from "@/infrastructure/cache"

describe("InMemoryCacheService", () => {
  it("should cache and retrieve values", async () => {
    const cache = new InMemoryCacheService()
    await cache.set("test", { value: 123 })
    const result = await cache.get("test")
    expect(result).toEqual({ value: 123 })
  })

  it("should expire after TTL", async () => {
    const cache = new InMemoryCacheService()
    await cache.set("test", "value", 1)
    await new Promise(resolve => setTimeout(resolve, 1100))
    const result = await cache.get("test")
    expect(result).toBeNull()
  })
})
```

### Integration Tests

```typescript
import { CacheFactory } from "@/infrastructure/cache"

describe("AI Cache Integration", () => {
  it("should reduce AI API calls", async () => {
    const apiCallSpy = vi.fn()

    // First call - cache miss
    await service.assessRisks(metrics)
    expect(apiCallSpy).toHaveBeenCalledTimes(1)

    // Second call - cache hit
    await service.assessRisks(metrics)
    expect(apiCallSpy).toHaveBeenCalledTimes(1) // Still 1!
  })
})
```

## Troubleshooting

### Common Issues

**1. Redis Connection Failed**
```
Error: Redis connection failed, falling back to in-memory cache
```
- Check `REDIS_URL` environment variable
- Verify Redis server is running
- Check network connectivity
- **Solution**: System automatically falls back to in-memory cache

**2. Cache Not Working**
```
// Check cache stats
const stats = cache.getStats()
console.log(stats.hitRate) // Should be > 0 for repeated requests
```
- Enable logging to see cache operations
- Verify generateCacheKey produces same key for same input
- Check TTL hasn't expired

**3. Memory Issues (In-Memory Cache)**
```
// Reduce max size
const cache = new InMemoryCacheService({ maxSize: 500 })
```
- Monitor cache size via getStats()
- Reduce maxSize config
- Switch to Redis for production

## Best Practices

1. **Use CacheFactory**: Let it choose the best implementation
2. **Appropriate TTLs**: Match TTL to data volatility
3. **Enable Logging in Dev**: Debug cache behavior early
4. **Monitor Hit Rate**: Target >70% for effective caching
5. **Invalidate on Updates**: Clear cache after data changes
6. **Graceful Degradation**: Always have fallback logic

## Future Enhancements

- [ ] Tag-based invalidation
- [ ] Distributed cache lock (prevent thundering herd)
- [ ] Cache warming on startup
- [ ] Metrics dashboard
- [ ] Configurable serialization (MessagePack, etc.)
- [ ] Multi-level caching (L1: Memory, L2: Redis)

## Related Files

- `infrastructure/cache/cache-service.ts` - Interface definitions
- `infrastructure/cache/in-memory-cache-service.ts` - In-memory implementation
- `infrastructure/cache/redis-cache-service.ts` - Redis implementation
- `infrastructure/cache/cache-factory.ts` - Factory and singleton
- `infrastructure/ai/risk-assessment-service.ts` - Risk assessment with cache
- `infrastructure/ai/revenue-forecast-service.ts` - Revenue forecast with cache

## Support

For issues or questions:
1. Check this documentation
2. Review cache logs (enable logging)
3. Check cache statistics
4. Consult the team

---

**Last Updated**: 2025-11-22
**Version**: 1.0.0
