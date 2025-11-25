/**
 * Cache Key Builders
 * Sprint 7 - Performance Optimization
 *
 * Centralized cache key generation for consistent caching across the application.
 */

import { format } from "date-fns";

/**
 * Revenue Analytics Cache Keys
 */
export const RevenueCacheKeys = {
  metrics: (startDate: Date, endDate: Date, comparisonStart?: Date) => {
    const key = `analytics:revenue:metrics:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}`;
    return comparisonStart
      ? `${key}:${format(comparisonStart, "yyyy-MM-dd")}`
      : key;
  },

  timeSeries: (startDate: Date, endDate: Date, granularity: string) => {
    return `analytics:revenue:timeseries:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}:${granularity}`;
  },

  topProducts: (startDate: Date, endDate: Date, limit: number) => {
    return `analytics:revenue:top-products:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}:${limit}`;
  },

  topCustomers: (startDate: Date, endDate: Date, limit: number) => {
    return `analytics:revenue:top-customers:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}:${limit}`;
  },

  orderStatus: (startDate: Date, endDate: Date) => {
    return `analytics:revenue:order-status:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}`;
  },
};

/**
 * Customer Analytics Cache Keys
 */
export const CustomerCacheKeys = {
  metrics: (startDate: Date, endDate: Date) => {
    return `analytics:customer:metrics:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}`;
  },

  segmentation: (startDate: Date, endDate: Date) => {
    return `analytics:customer:segmentation:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}`;
  },

  churnRisk: (riskLevel?: string) => {
    return riskLevel
      ? `analytics:customer:churn:${riskLevel}`
      : "analytics:customer:churn:all";
  },

  cohortRetention: (cohortMonth: string) => {
    return `analytics:customer:cohort:${cohortMonth}`;
  },

  tierDistribution: () => {
    return "analytics:customer:tier-distribution";
  },

  platformDistribution: () => {
    return "analytics:customer:platform-distribution";
  },
};

/**
 * Staff Analytics Cache Keys
 */
export const StaffCacheKeys = {
  performance: (staffId: string, startDate: Date, endDate: Date) => {
    return `analytics:staff:performance:${staffId}:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}`;
  },

  teamPerformance: (startDate: Date, endDate: Date) => {
    return `analytics:staff:team:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}`;
  },

  ranking: (startDate: Date, endDate: Date, limit: number) => {
    return `analytics:staff:ranking:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}:${limit}`;
  },

  activity: (staffId: string, startDate: Date, endDate: Date) => {
    return `analytics:staff:activity:${staffId}:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}`;
  },

  trend: (staffId: string, period: string) => {
    return `analytics:staff:trend:${staffId}:${period}`;
  },
};

/**
 * Campaign Analytics Cache Keys
 */
export const CampaignCacheKeys = {
  analytics: (campaignId: number) => {
    return `analytics:campaign:${campaignId}`;
  },

  comparison: (campaignIds: number[]) => {
    return `analytics:campaign:compare:${campaignIds.sort().join("-")}`;
  },

  platformPerformance: (startDate: Date, endDate: Date) => {
    return `analytics:campaign:platform:${format(startDate, "yyyy-MM-dd")}:${format(endDate, "yyyy-MM-dd")}`;
  },
};

/**
 * Forecast Cache Keys
 */
export const ForecastCacheKeys = {
  revenue: (daysAhead: number, model: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return `forecast:revenue:${today}:${daysAhead}:${model}`;
  },

  inventory: (daysAhead: number, productId?: number) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return productId
      ? `forecast:inventory:${today}:${daysAhead}:${productId}`
      : `forecast:inventory:${today}:${daysAhead}:all`;
  },

  churn: (riskLevel?: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return riskLevel
      ? `forecast:churn:${today}:${riskLevel}`
      : `forecast:churn:${today}:all`;
  },

  trend: (metric: string, period: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return `forecast:trend:${today}:${metric}:${period}`;
  },
};

/**
 * Cache invalidation helpers
 */
export const CacheInvalidation = {
  /**
   * Invalidate all analytics caches
   */
  allAnalytics: () => ["analytics:*", "forecast:*"],

  /**
   * Invalidate revenue-related caches
   */
  revenue: () => ["analytics:revenue:*", "forecast:revenue:*"],

  /**
   * Invalidate customer-related caches
   */
  customer: () => [
    "analytics:customer:*",
    "forecast:churn:*",
    "forecast:trend:*:customers:*",
  ],

  /**
   * Invalidate staff-related caches
   */
  staff: () => ["analytics:staff:*"],

  /**
   * Invalidate campaign-related caches
   */
  campaign: () => ["analytics:campaign:*"],

  /**
   * Invalidate forecast caches
   */
  forecast: () => ["forecast:*"],
};

/**
 * Cache TTL configurations (in seconds)
 */
export const CacheTTL = {
  // Analytics data - 30 minutes (frequently accessed, changes often)
  analytics: 1800,

  // Forecasts - 1 hour (computation-heavy, changes daily)
  forecast: 3600,

  // Top lists - 15 minutes (moderate frequency)
  topLists: 900,

  // Distributions - 1 hour (relatively stable)
  distributions: 3600,

  // Long-term trends - 4 hours (very stable)
  trends: 14400,
};
