/**
 * Customer Analytics Repository
 *
 * Implements customer behavior analytics queries using MongoDB aggregation pipelines.
 * Analyzes customer and order data to generate customer insights.
 */

import { BaseRepository } from "@/infrastructure/db/base-repository";
import {
  CustomerMetrics,
  CustomerSegmentStats,
  PurchasePattern,
  CohortRetention,
  CustomerRetention,
  RFMSegment,
  calculateChurnRisk,
  calculateRFMScores,
  getRFMSegmentName,
  DEFAULT_CHURN_THRESHOLDS,
} from "@/core/domain/analytics/customer-metrics";
import {
  CustomerAnalyticsService,
  CustomerMetricsQuery,
  CustomerSegmentationQuery,
  PurchasePatternsQuery,
  ChurnRiskQuery,
  CohortRetentionQuery,
  RFMAnalysisQuery,
} from "@/core/application/interfaces/analytics/customer-analytics-service";
import { format, addMonths } from "date-fns";

/**
 * Dummy entity for BaseRepository
 */
interface AnalyticsEntity {
  id: string;
}

export class CustomerAnalyticsRepository
  extends BaseRepository<AnalyticsEntity, string>
  implements CustomerAnalyticsService {
  protected collectionName = "customers";

  /**
   * Get customer metrics for a given period
   */
  async getCustomerMetrics(query: CustomerMetricsQuery): Promise<CustomerMetrics> {
    const client = await this.getClient();
    const customersCollection = client.db(process.env.MONGODB_DB).collection("customers");
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");

    // Count total customers
    const totalCustomers = await customersCollection.countDocuments();

    // Get customers who made their first order in this period (new customers)
    const newCustomersResult = await ordersCollection
      .aggregate([
        {
          $group: {
            _id: "$customerId",
            firstOrderDate: { $min: "$createdAt" },
          },
        },
        {
          $match: {
            firstOrderDate: {
              $gte: query.startDate,
              $lte: query.endDate,
            },
          },
        },
        { $count: "count" },
      ])
      .toArray();

    const newCustomers = newCustomersResult[0]?.count || 0;

    // Get customers who ordered in this period but had orders before (returning customers)
    const returningCustomersResult = await ordersCollection
      .aggregate([
        {
          $group: {
            _id: "$customerId",
            firstOrderDate: { $min: "$createdAt" },
            ordersInPeriod: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$createdAt", query.startDate] },
                      { $lte: ["$createdAt", query.endDate] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $match: {
            firstOrderDate: { $lt: query.startDate },
            ordersInPeriod: { $gt: 0 },
          },
        },
        { $count: "count" },
      ])
      .toArray();

    const returningCustomers = returningCustomersResult[0]?.count || 0;

    // Calculate churn rate (simplified: customers who haven't ordered in 90+ days)
    const churnThreshold = new Date();
    churnThreshold.setDate(churnThreshold.getDate() - DEFAULT_CHURN_THRESHOLDS.highRiskDays);

    const activeCustomersResult = await ordersCollection
      .aggregate([
        {
          $group: {
            _id: "$customerId",
            lastOrderDate: { $max: "$createdAt" },
          },
        },
        {
          $match: {
            lastOrderDate: { $gte: churnThreshold },
          },
        },
        { $count: "count" },
      ])
      .toArray();

    const activeCustomers = activeCustomersResult[0]?.count || 0;
    const churnRate = totalCustomers > 0 ? ((totalCustomers - activeCustomers) / totalCustomers) * 100 : 0;

    // Get segment distribution
    const segmentDistribution = await this.getCustomerSegmentation({
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      churnRate,
      period: { startDate: query.startDate, endDate: query.endDate },
      segmentDistribution,
    };
  }

  /**
   * Get customer segmentation by tier
   */
  async getCustomerSegmentation(query: CustomerSegmentationQuery): Promise<CustomerSegmentStats[]> {
    const client = await this.getClient();
    const customersCollection = client.db(process.env.MONGODB_DB).collection("customers");
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");

    // Get all customers with their stats
    const pipeline = [
      {
        $lookup: {
          from: "orders",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
                createdAt: {
                  $gte: query.startDate,
                  $lte: query.endDate,
                },
                status: "completed",
                paymentStatus: "success",
              },
            },
          ],
          as: "orders",
        },
      },
      {
        $group: {
          _id: "$tier",
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $reduce: {
                input: "$orders",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.total"] },
              },
            },
          },
          totalOrders: {
            $sum: { $size: "$orders" },
          },
        },
      },
      {
        $project: {
          tier: "$_id",
          count: 1,
          averageRevenue: {
            $cond: [{ $eq: ["$count", 0] }, 0, { $divide: ["$totalRevenue", "$count"] }],
          },
          averageOrderFrequency: {
            $cond: [{ $eq: ["$count", 0] }, 0, { $divide: ["$totalOrders", "$count"] }],
          },
        },
      },
    ];

    const results = await customersCollection.aggregate(pipeline).toArray();

    const totalCount = results.reduce((sum, r) => sum + r.count, 0);

    return results.map((doc) => ({
      tier: doc.tier,
      count: doc.count,
      percentage: totalCount > 0 ? (doc.count / totalCount) * 100 : 0,
      averageRevenue: doc.averageRevenue,
      averageOrderFrequency: doc.averageOrderFrequency,
    }));
  }

  /**
   * Get purchase patterns for customers
   */
  async getPurchasePatterns(query: PurchasePatternsQuery): Promise<PurchasePattern[]> {
    const client = await this.getClient();
    const customersCollection = client.db(process.env.MONGODB_DB).collection("customers");
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");

    const matchStage: any = {
      status: "completed",
      paymentStatus: "success",
    };

    if (query.customerId) {
      matchStage.customerId = query.customerId;
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $group: {
          _id: "$customerId",
          firstPurchaseDate: { $min: "$createdAt" },
          lastPurchaseDate: { $max: "$createdAt" },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          orderDates: { $push: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          customerId: "$_id",
          customerName: { $ifNull: ["$customer.name", "Unknown"] },
          tier: { $ifNull: ["$customer.tier", "new"] },
          platform: "$customer.platform",
          phone: "$customer.phone",
          firstPurchaseDate: 1,
          lastPurchaseDate: 1,
          totalOrders: 1,
          totalRevenue: 1,
          averageOrderValue: { $divide: ["$totalRevenue", "$totalOrders"] },
          daysSinceLastPurchase: {
            $divide: [
              { $subtract: [new Date(), "$lastPurchaseDate"] },
              1000 * 60 * 60 * 24,
            ],
          },
          averageDaysBetweenOrders: {
            $cond: [
              { $lte: ["$totalOrders", 1] },
              0,
              {
                $divide: [
                  { $subtract: ["$lastPurchaseDate", "$firstPurchaseDate"] },
                  { $multiply: [{ $subtract: ["$totalOrders", 1] }, 1000 * 60 * 60 * 24] },
                ],
              },
            ],
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ];

    if (query.limit) {
      pipeline.push({ $limit: query.limit });
    }

    const results = await ordersCollection.aggregate(pipeline).toArray();

    // Calculate churn risk and get favorite categories for each customer
    const patterns: PurchasePattern[] = [];

    for (const doc of results) {
      const churnRisk = calculateChurnRisk(doc.daysSinceLastPurchase);

      // Get favorite categories (simplified - would need category data in order items)
      const favoriteCategories = await this.getFavoriteCategories(doc.customerId);

      patterns.push({
        customerId: doc.customerId,
        customerName: doc.customerName,
        firstPurchaseDate: doc.firstPurchaseDate,
        lastPurchaseDate: doc.lastPurchaseDate,
        totalOrders: doc.totalOrders,
        totalRevenue: doc.totalRevenue,
        averageOrderValue: doc.averageOrderValue,
        daysSinceLastPurchase: Math.floor(doc.daysSinceLastPurchase),
        favoriteCategories,
        averageDaysBetweenOrders: doc.averageDaysBetweenOrders,
        churnRisk,
        platform: doc.platform,
        phone: doc.phone,
      });
    }

    return patterns;
  }

  /**
   * Get customers at risk of churning
   */
  async getChurnRiskCustomers(query: ChurnRiskQuery): Promise<PurchasePattern[]> {
    const thresholds = query.thresholds || DEFAULT_CHURN_THRESHOLDS;

    // Get all purchase patterns
    const patterns = await this.getPurchasePatterns({ limit: query.limit * 3 });

    // Filter by churn risk level
    let filteredPatterns = patterns;
    if (query.riskLevel) {
      filteredPatterns = patterns.filter((p) => p.churnRisk === query.riskLevel);
    } else {
      // If no risk level specified, get high and medium risk only
      filteredPatterns = patterns.filter((p) => p.churnRisk !== "low");
    }

    // Sort by days since last purchase (descending) and limit
    return filteredPatterns
      .sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase)
      .slice(0, query.limit);
  }

  /**
   * Get cohort retention analysis
   */
  async getCohortRetention(query: CohortRetentionQuery): Promise<CohortRetention> {
    const client = await this.getClient();
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");

    const cohortEndDate = addMonths(query.cohortStartDate, 1);

    // Get customers who made their first order in the cohort period
    const cohortCustomersResult = await ordersCollection
      .aggregate([
        {
          $group: {
            _id: "$customerId",
            firstOrderDate: { $min: "$createdAt" },
          },
        },
        {
          $match: {
            firstOrderDate: {
              $gte: query.cohortStartDate,
              $lt: cohortEndDate,
            },
          },
        },
      ])
      .toArray();

    const cohortCustomerIds = cohortCustomersResult.map((c) => c._id);
    const cohortSize = cohortCustomerIds.length;

    // Track retention for each period
    const retentionPeriods: CustomerRetention[] = [];

    for (let i = 0; i < query.periods; i++) {
      const periodStart = addMonths(query.cohortStartDate, i);
      const periodEnd = addMonths(periodStart, 1);

      // Count how many cohort customers ordered in this period
      const retainedCount = await ordersCollection.countDocuments({
        customerId: { $in: cohortCustomerIds },
        createdAt: {
          $gte: periodStart,
          $lt: periodEnd,
        },
      });

      // Get unique customers (not just order count)
      const uniqueRetained = await ordersCollection.distinct("customerId", {
        customerId: { $in: cohortCustomerIds },
        createdAt: {
          $gte: periodStart,
          $lt: periodEnd,
        },
      });

      retentionPeriods.push({
        period: `Month ${i + 1}`,
        cohortSize,
        retainedCustomers: uniqueRetained.length,
        retentionRate: cohortSize > 0 ? (uniqueRetained.length / cohortSize) * 100 : 0,
      });
    }

    return {
      cohortStartDate: query.cohortStartDate,
      cohortName: format(query.cohortStartDate, "MMM yyyy"),
      retentionPeriods,
    };
  }

  /**
   * Get RFM segmentation
   */
  async getRFMSegmentation(query: RFMAnalysisQuery): Promise<RFMSegment[]> {
    const patterns = await this.getPurchasePatterns({
      limit: query.limit || 1000,
    });

    if (patterns.length === 0) {
      return [];
    }

    // Calculate quartiles for R, F, M
    const recencies = patterns.map((p) => p.daysSinceLastPurchase).sort((a, b) => a - b);
    const frequencies = patterns.map((p) => p.totalOrders).sort((a, b) => a - b);
    const monetaries = patterns.map((p) => p.totalRevenue).sort((a, b) => a - b);

    const getQuartiles = (arr: number[]) => {
      const q1 = arr[Math.floor(arr.length * 0.25)];
      const q2 = arr[Math.floor(arr.length * 0.5)];
      const q3 = arr[Math.floor(arr.length * 0.75)];
      const q4 = arr[arr.length - 1];
      return [q1, q2, q3, q4];
    };

    const recencyQuartiles = getQuartiles(recencies);
    const frequencyQuartiles = getQuartiles(frequencies);
    const monetaryQuartiles = getQuartiles(monetaries);

    // Calculate RFM scores for each customer
    const rfmSegments: RFMSegment[] = patterns.map((pattern) => {
      const scores = calculateRFMScores(
        pattern.daysSinceLastPurchase,
        pattern.totalOrders,
        pattern.totalRevenue,
        recencyQuartiles,
        frequencyQuartiles,
        monetaryQuartiles
      );

      const rfmScore = `${scores.recencyScore}${scores.frequencyScore}${scores.monetaryScore}`;
      const segment = getRFMSegmentName(rfmScore);

      return {
        customerId: pattern.customerId,
        customerName: pattern.customerName,
        recency: pattern.daysSinceLastPurchase,
        frequency: pattern.totalOrders,
        monetary: pattern.totalRevenue,
        recencyScore: scores.recencyScore,
        frequencyScore: scores.frequencyScore,
        monetaryScore: scores.monetaryScore,
        rfmScore,
        segment,
      };
    });

    return rfmSegments;
  }

  /**
   * Helper: Get favorite categories for a customer
   */
  private async getFavoriteCategories(customerId: string): Promise<any[]> {
    const client = await this.getClient();
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");

    // This is a simplified version - in production, you'd join with products to get category info
    const pipeline = [
      {
        $match: {
          customerId,
          status: "completed",
          paymentStatus: "success",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          orderCount: { $sum: 1 },
          productName: { $first: "$items.name" },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 3 },
    ];

    const results = await ordersCollection.aggregate(pipeline).toArray();

    // Map to category format (simplified - would need actual category lookup)
    return results.map((r, index) => ({
      categoryId: index + 1, // Placeholder
      categoryName: r.productName || "Unknown",
      orderCount: r.orderCount,
    }));
  }
}
