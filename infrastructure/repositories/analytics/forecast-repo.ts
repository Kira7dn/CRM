/**
 * Forecast Repository
 * Sprint 6 - Module 1.5: AI-Powered Forecasting
 *
 * Implements statistical forecasting models using simple-statistics library.
 * Uses time-series analysis for revenue predictions, demand forecasting, and churn prediction.
 */

import { BaseRepository } from "@/infrastructure/db/base-repository";
import {
  RevenueForecast,
  InventoryForecast,
  ChurnPrediction,
  TrendAnalysis,
  calculateRiskLevel,
  calculateTrendDirection,
} from "@/core/domain/analytics/forecast";
import {
  ForecastService,
  RevenueForecastPayload,
  InventoryForecastPayload,
  ChurnPredictionPayload,
  TrendAnalysisPayload,
} from "@/core/application/interfaces/forecast-service";
import { linearRegression, linearRegressionLine, mean, standardDeviation } from "simple-statistics";

/**
 * Dummy entity for BaseRepository
 */
interface ForecastEntity {
  id: string;
}

export class ForecastRepository
  extends BaseRepository<ForecastEntity, string>
  implements ForecastService
{
  protected collectionName = "orders";

  /**
   * Get revenue forecast using linear regression on historical data
   */
  async getRevenueForecast(payload: RevenueForecastPayload): Promise<RevenueForecast[]> {
    const collection = await this.getCollection();
    const { daysAhead, model = "simple", startDate = new Date() } = payload;

    // Get historical revenue data (last 90 days)
    const historicalDays = 90;
    const historicalStartDate = new Date(startDate);
    historicalStartDate.setDate(historicalStartDate.getDate() - historicalDays);

    const historicalData = await collection
      .aggregate([
        {
          $match: {
            status: { $in: ["completed", "delivered"] },
            createdAt: {
              $gte: historicalStartDate,
              $lt: startDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    if (historicalData.length < 7) {
      // Not enough data for forecasting
      return [];
    }

    // Prepare data for linear regression
    // Convert dates to numeric values (days since first data point)
    const dataPoints: [number, number][] = historicalData.map((item, index) => [
      index,
      item.revenue as number,
    ]);

    // Calculate linear regression
    const regressionLine = linearRegressionLine(linearRegression(dataPoints));

    // Calculate standard deviation for confidence interval
    const revenues = dataPoints.map(([_, revenue]) => revenue);
    const stdDev = standardDeviation(revenues);

    // Generate forecasts
    const forecasts: RevenueForecast[] = [];
    const lastIndex = dataPoints.length - 1;

    for (let i = 1; i <= daysAhead; i++) {
      const futureIndex = lastIndex + i;
      const predictedRevenue = regressionLine(futureIndex);

      const forecastDate = new Date(startDate);
      forecastDate.setDate(forecastDate.getDate() + i);

      // Confidence interval: ±1.96 * stdDev for 95% confidence
      const margin = 1.96 * stdDev;

      forecasts.push({
        forecastDate,
        predictedRevenue: Math.max(0, predictedRevenue),
        confidenceInterval: {
          lower: Math.max(0, predictedRevenue - margin),
          upper: predictedRevenue + margin,
        },
      });
    }

    return forecasts;
  }

  /**
   * Get inventory forecast based on sales velocity
   */
  async getInventoryForecast(payload: InventoryForecastPayload): Promise<InventoryForecast[]> {
    const collection = await this.getCollection();
    const { productId, daysAhead } = payload;

    // Get historical sales data (last 30 days)
    const historicalDays = 30;
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - historicalDays);

    const matchStage: any = {
      status: { $in: ["completed", "delivered"] },
      createdAt: { $gte: startDate, $lt: endDate },
    };

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: "$items" },
    ];

    if (productId) {
      pipeline.push({ $match: { "items.productId": productId } });
    }

    pipeline.push(
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalQuantity: { $sum: "$items.quantity" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      }
    );

    const salesData = await collection.aggregate(pipeline).toArray();

    // Calculate forecasts
    const forecasts: InventoryForecast[] = salesData.map((item) => {
      const avgDailyDemand = (item.totalQuantity as number) / historicalDays;
      const predictedDemand = Math.ceil(avgDailyDemand * daysAhead);
      const recommendedRestock = Math.ceil(predictedDemand * 1.2); // 20% buffer

      return {
        productId: item._id as number,
        productName: item.productName as string,
        predictedDemand,
        recommendedRestock,
        forecastPeriodDays: daysAhead,
        // daysUntilStockout would require current stock data
      };
    });

    return forecasts;
  }

  /**
   * Predict customer churn using RFM analysis
   */
  async predictCustomerChurn(payload: ChurnPredictionPayload): Promise<ChurnPrediction[]> {
    const customersCollection = await this.getClient()
      .then((client) => client.db().collection("customers"));
    const ordersCollection = await this.getCollection();

    const { customerId, riskLevelFilter } = payload;

    // Get all customers or specific customer
    const customerMatch: any = {};
    if (customerId) {
      customerMatch.id = customerId;
    }

    const customers = await customersCollection.find(customerMatch).toArray();

    const predictions: ChurnPrediction[] = [];
    const now = new Date();

    for (const customer of customers) {
      // Get customer's order history
      const orders = await ordersCollection
        .find({ customerId: customer.id })
        .sort({ createdAt: -1 })
        .toArray();

      if (orders.length === 0) {
        // New customer with no orders - high churn risk
        const prediction: ChurnPrediction = {
          customerId: customer.id as string,
          customerName: customer.name as string,
          churnProbability: 0.8,
          riskLevel: "high",
          factors: ["No orders yet", "New customer"],
          recommendedAction: "Send welcome offer or onboarding campaign",
          totalOrders: 0,
          totalRevenue: 0,
        };
        predictions.push(prediction);
        continue;
      }

      // Calculate RFM metrics
      const lastOrder = orders[0];
      const lastOrderDate = new Date(lastOrder.createdAt as Date);
      const daysSinceLastOrder = Math.floor(
        (now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + ((order.total as number) || 0),
        0
      );

      // Calculate churn probability based on multiple factors
      let churnScore = 0;
      const factors: string[] = [];

      // Recency factor (0-0.4)
      if (daysSinceLastOrder > 90) {
        churnScore += 0.4;
        factors.push(`No purchase in ${daysSinceLastOrder} days`);
      } else if (daysSinceLastOrder > 60) {
        churnScore += 0.3;
        factors.push(`Last purchase ${daysSinceLastOrder} days ago`);
      } else if (daysSinceLastOrder > 30) {
        churnScore += 0.2;
        factors.push(`Last purchase ${daysSinceLastOrder} days ago`);
      }

      // Frequency factor (0-0.3)
      if (totalOrders === 1) {
        churnScore += 0.3;
        factors.push("Only one purchase");
      } else if (totalOrders < 3) {
        churnScore += 0.2;
        factors.push("Low purchase frequency");
      } else if (totalOrders < 5) {
        churnScore += 0.1;
      }

      // Monetary factor (0-0.3)
      const avgOrderValue = totalRevenue / totalOrders;
      if (avgOrderValue < 100000) {
        // VND
        churnScore += 0.3;
        factors.push("Low average order value");
      } else if (avgOrderValue < 300000) {
        churnScore += 0.2;
        factors.push("Below average order value");
      }

      // Order trend (recent vs older orders)
      if (orders.length >= 3) {
        const recentOrders = orders.slice(0, Math.ceil(orders.length / 2)).length;
        const olderOrders = orders.length - recentOrders;

        if (recentOrders < olderOrders) {
          churnScore += 0.2;
          factors.push("Decreased order frequency");
        }
      }

      const churnProbability = Math.min(1, churnScore);
      const riskLevel = calculateRiskLevel(churnProbability);

      // Determine recommended action
      let recommendedAction = "";
      if (riskLevel === "high") {
        recommendedAction = "Send urgent win-back campaign with special discount";
      } else if (riskLevel === "medium") {
        recommendedAction = "Send re-engagement email or personalized offer";
      } else {
        recommendedAction = "Continue regular communication and loyalty rewards";
      }

      const prediction: ChurnPrediction = {
        customerId: customer.id as string,
        customerName: customer.name as string,
        churnProbability,
        riskLevel,
        factors: factors.length > 0 ? factors : ["Customer in good standing"],
        recommendedAction,
        lastOrderDate,
        daysSinceLastOrder,
        totalOrders,
        totalRevenue,
      };

      // Filter by risk level if specified
      if (!riskLevelFilter || riskLevel === riskLevelFilter) {
        predictions.push(prediction);
      }
    }

    // Sort by churn probability (highest first)
    return predictions.sort((a, b) => b.churnProbability - a.churnProbability);
  }

  /**
   * Get trend analysis for a metric
   */
  async getTrendAnalysis(payload: TrendAnalysisPayload): Promise<TrendAnalysis> {
    const collection = await this.getCollection();
    const { metric, period, startDate = new Date() } = payload;

    // Calculate period duration
    let periodDays = 7;
    if (period === "month") periodDays = 30;
    if (period === "quarter") periodDays = 90;

    // Get current period data
    const currentEnd = new Date(startDate);
    const currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() - periodDays);

    // Get previous period data for comparison
    const previousEnd = new Date(currentStart);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - periodDays);

    let currentValue = 0;
    let previousValue = 0;
    const dataPoints: { date: Date; value: number }[] = [];

    if (metric === "revenue") {
      // Revenue trend
      const [currentData, previousData] = await Promise.all([
        this.getRevenueForPeriod(currentStart, currentEnd),
        this.getRevenueForPeriod(previousStart, previousEnd),
      ]);

      currentValue = currentData.total;
      previousValue = previousData.total;
      dataPoints.push(...currentData.dataPoints);
    } else if (metric === "orders") {
      // Orders trend
      const [currentCount, previousCount] = await Promise.all([
        collection.countDocuments({
          createdAt: { $gte: currentStart, $lt: currentEnd },
          status: { $in: ["completed", "delivered"] },
        }),
        collection.countDocuments({
          createdAt: { $gte: previousStart, $lt: previousEnd },
          status: { $in: ["completed", "delivered"] },
        }),
      ]);

      currentValue = currentCount;
      previousValue = previousCount;
    } else if (metric === "customers") {
      // New customers trend
      const customersCollection = await this.getClient()
        .then((client) => client.db().collection("customers"));

      const [currentCount, previousCount] = await Promise.all([
        customersCollection.countDocuments({
          createdAt: { $gte: currentStart, $lt: currentEnd },
        }),
        customersCollection.countDocuments({
          createdAt: { $gte: previousStart, $lt: previousEnd },
        }),
      ]);

      currentValue = currentCount;
      previousValue = previousCount;
    }

    // Calculate change percentage
    const changePercent =
      previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

    const trend = calculateTrendDirection(changePercent);

    // Generate insights
    const insights: string[] = [];
    const absChange = Math.abs(changePercent);

    if (trend === "up") {
      insights.push(
        `${metric.charAt(0).toUpperCase() + metric.slice(1)} increased by ${absChange.toFixed(1)}% compared to previous ${period}`
      );
      if (absChange > 20) {
        insights.push("Strong growth trend detected");
      }
    } else if (trend === "down") {
      insights.push(
        `${metric.charAt(0).toUpperCase() + metric.slice(1)} decreased by ${absChange.toFixed(1)}% compared to previous ${period}`
      );
      if (absChange > 20) {
        insights.push("Significant decline - immediate attention needed");
      }
    } else {
      insights.push(`${metric.charAt(0).toUpperCase() + metric.slice(1)} remained stable`);
    }

    return {
      metric,
      period,
      trend,
      changePercent,
      currentValue,
      previousValue,
      insights,
      dataPoints,
    };
  }

  /**
   * Helper: Get revenue for a period with daily breakdown
   */
  private async getRevenueForPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<{ total: number; dataPoints: { date: Date; value: number }[] }> {
    const collection = await this.getCollection();

    const result = await collection
      .aggregate([
        {
          $match: {
            status: { $in: ["completed", "delivered"] },
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    const total = result.reduce((sum, item) => sum + (item.revenue as number), 0);
    const dataPoints = result.map((item) => ({
      date: new Date(item._id as string),
      value: item.revenue as number,
    }));

    return { total, dataPoints };
  }
}
