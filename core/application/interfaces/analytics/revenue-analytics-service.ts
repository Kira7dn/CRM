/**
 * Revenue Analytics Service Interface
 *
 * Defines the contract for revenue analytics data access.
 * Repository implementations must implement these methods.
 */

import {
  DateRange,
  TimeGranularity,
  RevenueMetrics,
  RevenueTimeSeries,
  TopProduct,
  TopCustomer,
  OrderStatusDistribution,
} from "@/core/domain/analytics/revenue-metrics";

/**
 * Revenue analytics query parameters
 */
export interface RevenueMetricsQuery extends Partial<DateRange> {
  comparisonStartDate?: Date;
  comparisonEndDate?: Date;
}

export interface RevenueTimeSeriesQuery extends DateRange {
  granularity: TimeGranularity;
}

export interface TopItemsQuery extends DateRange {
  limit: number;
}

export interface OrderStatusQuery extends DateRange {}

/**
 * Revenue Analytics Service Interface
 */
export interface RevenueAnalyticsService {
  /**
   * Get revenue metrics for a given period
   * Includes comparison with previous period if comparison dates provided
   */
  getRevenueMetrics(query: RevenueMetricsQuery): Promise<RevenueMetrics>;

  /**
   * Get revenue time-series data with specified granularity
   */
  getRevenueTimeSeries(query: RevenueTimeSeriesQuery): Promise<RevenueTimeSeries[]>;

  /**
   * Get top-performing products by revenue
   */
  getTopProducts(query: TopItemsQuery): Promise<TopProduct[]>;

  /**
   * Get top customers by revenue
   */
  getTopCustomers(query: TopItemsQuery): Promise<TopCustomer[]>;

  /**
   * Get order status distribution
   */
  getOrderStatusDistribution(query: OrderStatusQuery): Promise<OrderStatusDistribution[]>;
}
