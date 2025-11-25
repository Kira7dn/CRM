/**
 * Revenue Analytics Repository
 *
 * Implements revenue analytics queries using MongoDB aggregation pipelines.
 * Analyzes order data to generate revenue insights.
 *
 * Sprint 7: Added Redis caching for performance optimization.
 */

import { BaseRepository } from "@/infrastructure/db/base-repository";
import {
  RevenueMetrics,
  RevenueTimeSeries,
  TopProduct,
  TopCustomer,
  OrderStatusDistribution,
  calculatePercentageChange,
  calculateAOV,
  TimeGranularity,
} from "@/core/domain/analytics/revenue-metrics";
import {
  RevenueAnalyticsService,
  RevenueMetricsQuery,
  RevenueTimeSeriesQuery,
  TopItemsQuery,
  OrderStatusQuery,
} from "@/core/application/interfaces/analytics/revenue-analytics-service";
import { getCache } from "@/infrastructure/adapters/cache/redis-cache";
import { RevenueCacheKeys, CacheTTL } from "@/infrastructure/adapters/cache/cache-keys";

/**
 * Dummy entity for BaseRepository (analytics doesn't have a primary entity)
 */
interface AnalyticsEntity {
  id: string;
}

export class RevenueAnalyticsRepository
  extends BaseRepository<AnalyticsEntity, string>
  implements RevenueAnalyticsService {
  protected collectionName = "orders";
  private cache = getCache();

  /**
   * Get revenue metrics for a given period with optional comparison
   * Cached for performance (TTL: 30 minutes)
   */
  async getRevenueMetrics(query: RevenueMetricsQuery): Promise<RevenueMetrics> {
    // Default to last 30 days if no dates provided
    const endDate = query.endDate || new Date();
    const startDate = query.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build cache key
    const cacheKey = RevenueCacheKeys.metrics(
      startDate,
      endDate,
      query.comparisonStartDate
    );

    // Try to get from cache
    const cached = await this.cache.get<RevenueMetrics>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, compute metrics
    const collection = await this.getCollection();

    // Build match query for current period
    const matchQuery: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    // Aggregate current period metrics
    const [currentMetrics] = await collection
      .aggregate([
        { $match: matchQuery },
        {
          $facet: {
            completed: [
              { $match: { status: "completed", paymentStatus: "success" } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$total" },
                  totalOrders: { $sum: 1 },
                },
              },
            ],
            cancelled: [
              { $match: { status: "cancelled" } },
              { $count: "count" },
            ],
            returned: [
              { $match: { status: "returned" } },
              { $count: "count" },
            ],
            all: [{ $count: "count" }],
          },
        },
      ])
      .toArray();

    const completedData = currentMetrics.completed[0] || { totalRevenue: 0, totalOrders: 0 };
    const totalRevenue = completedData.totalRevenue || 0;
    const totalOrders = completedData.totalOrders || 0;
    const cancelledCount = currentMetrics.cancelled[0]?.count || 0;
    const returnedCount = currentMetrics.returned[0]?.count || 0;
    const allOrdersCount = currentMetrics.all[0]?.count || 1; // Avoid division by zero

    const averageOrderValue = calculateAOV(totalRevenue, totalOrders);
    const cancelRate = (cancelledCount / allOrdersCount) * 100;
    const returnRate = (returnedCount / allOrdersCount) * 100;

    const metrics: RevenueMetrics = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      cancelRate,
      returnRate,
      period: { startDate, endDate },
    };

    // Calculate comparison metrics if comparison period provided
    if (query.comparisonStartDate && query.comparisonEndDate) {
      const comparisonMatchQuery = {
        createdAt: {
          $gte: query.comparisonStartDate,
          $lte: query.comparisonEndDate,
        },
      };

      const [comparisonMetrics] = await collection
        .aggregate([
          { $match: comparisonMatchQuery },
          {
            $facet: {
              completed: [
                { $match: { status: "completed", paymentStatus: "success" } },
                {
                  $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" },
                    totalOrders: { $sum: 1 },
                  },
                },
              ],
            },
          },
        ])
        .toArray();

      const comparisonData = comparisonMetrics.completed[0] || { totalRevenue: 0, totalOrders: 0 };
      const prevRevenue = comparisonData.totalRevenue || 0;
      const prevOrders = comparisonData.totalOrders || 0;
      const prevAOV = calculateAOV(prevRevenue, prevOrders);

      metrics.comparisonPeriod = {
        revenue: prevRevenue,
        orders: prevOrders,
        changePercent: calculatePercentageChange(totalRevenue, prevRevenue),
        revenueChangePercent: calculatePercentageChange(totalRevenue, prevRevenue),
        ordersChangePercent: calculatePercentageChange(totalOrders, prevOrders),
        aovChangePercent: calculatePercentageChange(averageOrderValue, prevAOV),
      };
    }

    // Cache the result
    await this.cache.set(cacheKey, metrics, { ttl: CacheTTL.analytics });

    return metrics;
  }

  /**
   * Get revenue time-series data with specified granularity
   */
  async getRevenueTimeSeries(query: RevenueTimeSeriesQuery): Promise<RevenueTimeSeries[]> {
    const collection = await this.getCollection();

    // Build date grouping based on granularity
    const dateGroup = this.getDateGroupExpression(query.granularity);

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
          status: "completed",
          paymentStatus: "success",
        },
      },
      {
        $group: {
          _id: dateGroup,
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
          orderCount: 1,
          averageOrderValue: {
            $cond: [
              { $eq: ["$orderCount", 0] },
              0,
              { $divide: ["$revenue", "$orderCount"] },
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    return results.map((doc) => ({
      date: new Date(doc.date),
      revenue: doc.revenue,
      orderCount: doc.orderCount,
      averageOrderValue: doc.averageOrderValue,
    }));
  }

  /**
   * Get top-performing products by revenue
   */
  async getTopProducts(query: TopItemsQuery): Promise<TopProduct[]> {
    const collection = await this.getCollection();

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
          status: "completed",
          paymentStatus: "success",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            productId: "$items.productId",
            productName: "$items.name",
            image: "$items.image",
          },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          quantity: { $sum: "$items.quantity" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id.productId",
          productName: "$_id.productName",
          image: "$_id.image",
          revenue: 1,
          quantity: 1,
          orderCount: 1,
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: query.limit },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    return results.map((doc) => ({
      productId: doc.productId,
      productName: doc.productName,
      revenue: doc.revenue,
      orderCount: doc.orderCount,
      quantity: doc.quantity,
      image: doc.image,
    }));
  }

  /**
   * Get top customers by revenue
   */
  async getTopCustomers(query: TopItemsQuery): Promise<TopCustomer[]> {
    const collection = await this.getCollection();
    const customerCollection = await this.getClient().then((client) =>
      client.db(process.env.MONGODB_DB).collection("customers")
    );

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
          status: "completed",
          paymentStatus: "success",
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: query.limit },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    // Enrich with customer data
    const customerIds = results.map((r) => r._id);
    const customers = await customerCollection
      .find({ _id: { $in: customerIds } })
      .toArray();

    const customerMap = new Map(customers.map((c) => [c._id, c]));

    return results.map((doc) => {
      const customer = customerMap.get(doc._id);
      return {
        customerId: doc._id,
        customerName: customer?.name || "Unknown",
        totalRevenue: doc.totalRevenue,
        orderCount: doc.orderCount,
        tier: customer?.tier || "new",
        phone: customer?.phone,
        platform: customer?.platform,
      };
    });
  }

  /**
   * Get order status distribution
   */
  async getOrderStatusDistribution(query: OrderStatusQuery): Promise<OrderStatusDistribution[]> {
    const collection = await this.getCollection();

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "success"] }, "$total", 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    const totalOrders = results.reduce((sum, doc) => sum + doc.count, 0);

    return results.map((doc) => ({
      status: doc._id,
      count: doc.count,
      percentage: totalOrders > 0 ? (doc.count / totalOrders) * 100 : 0,
      revenue: doc.revenue,
    }));
  }

  /**
   * Helper: Get date grouping expression for MongoDB aggregation
   */
  private getDateGroupExpression(granularity: TimeGranularity): any {
    switch (granularity) {
      case "day":
        return {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
      case "week":
        return {
          $dateToString: {
            format: "%Y-W%V",
            date: "$createdAt",
          },
        };
      case "month":
        return {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
      case "quarter":
        return {
          year: { $year: "$createdAt" },
          quarter: {
            $ceil: { $divide: [{ $month: "$createdAt" }, 3] },
          },
        };
      case "year":
        return {
          $dateToString: { format: "%Y", date: "$createdAt" },
        };
      default:
        return {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }
  }
}
