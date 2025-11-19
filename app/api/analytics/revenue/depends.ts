/**
 * Dependency Injection Factory for Revenue Analytics
 *
 * Provides factory functions to create use case instances with their dependencies.
 * Used by both API routes and Server Actions.
 */

import { RevenueAnalyticsRepository } from "@/infrastructure/repositories/analytics/revenue-analytics-repo";
import { RevenueAnalyticsService } from "@/core/application/interfaces/analytics/revenue-analytics-service";

// Use Cases
import { GetRevenueMetricsUseCase } from "@/core/application/usecases/analytics/revenue/get-revenue-metrics";
import { GetRevenueTimeSeriesUseCase } from "@/core/application/usecases/analytics/revenue/get-revenue-time-series";
import { GetTopProductsUseCase } from "@/core/application/usecases/analytics/revenue/get-top-products";
import { GetTopCustomersUseCase } from "@/core/application/usecases/analytics/revenue/get-top-customers";
import { GetOrderStatusDistributionUseCase } from "@/core/application/usecases/analytics/revenue/get-order-status-distribution";

/**
 * Create repository instance
 */
const createRevenueAnalyticsRepository = async (): Promise<RevenueAnalyticsService> => {
  return new RevenueAnalyticsRepository();
};

/**
 * Create GetRevenueMetrics use case
 */
export const createGetRevenueMetricsUseCase = async () => {
  const service = await createRevenueAnalyticsRepository();
  return new GetRevenueMetricsUseCase(service);
};

/**
 * Create GetRevenueTimeSeries use case
 */
export const createGetRevenueTimeSeriesUseCase = async () => {
  const service = await createRevenueAnalyticsRepository();
  return new GetRevenueTimeSeriesUseCase(service);
};

/**
 * Create GetTopProducts use case
 */
export const createGetTopProductsUseCase = async () => {
  const service = await createRevenueAnalyticsRepository();
  return new GetTopProductsUseCase(service);
};

/**
 * Create GetTopCustomers use case
 */
export const createGetTopCustomersUseCase = async () => {
  const service = await createRevenueAnalyticsRepository();
  return new GetTopCustomersUseCase(service);
};

/**
 * Create GetOrderStatusDistribution use case
 */
export const createGetOrderStatusDistributionUseCase = async () => {
  const service = await createRevenueAnalyticsRepository();
  return new GetOrderStatusDistributionUseCase(service);
};
