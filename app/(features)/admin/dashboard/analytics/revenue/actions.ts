"use server";

/**
 * Server Actions for Revenue Analytics
 *
 * These actions are called from client components to fetch analytics data.
 * They use the use cases from the dependency injection factory.
 */

import {
  createGetRevenueMetricsUseCase,
  createGetRevenueTimeSeriesUseCase,
  createGetTopProductsUseCase,
  createGetTopCustomersUseCase,
  createGetOrderStatusDistributionUseCase,
} from "@/app/api/analytics/revenue/depends";
import { TimeGranularity } from "@/core/domain/analytics/revenue-metrics";

/**
 * Get revenue metrics for a given period
 */
export async function getRevenueMetrics(
  startDate: Date,
  endDate: Date,
  comparisonStartDate?: Date,
  comparisonEndDate?: Date
) {
  try {
    const useCase = await createGetRevenueMetricsUseCase();
    const result = await useCase.execute({
      startDate,
      endDate,
      comparisonStartDate,
      comparisonEndDate,
    });
    return { success: true, data: result.metrics };
  } catch (error) {
    console.error("[getRevenueMetrics] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch revenue metrics",
    };
  }
}

/**
 * Get revenue time-series data
 */
export async function getRevenueTimeSeries(
  startDate: Date,
  endDate: Date,
  granularity: TimeGranularity = "day"
) {
  try {
    const useCase = await createGetRevenueTimeSeriesUseCase();
    const result = await useCase.execute({
      startDate,
      endDate,
      granularity,
    });
    return { success: true, data: result.timeSeries };
  } catch (error) {
    console.error("[getRevenueTimeSeries] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch time series data",
    };
  }
}

/**
 * Get top products by revenue
 */
export async function getTopProducts(
  startDate: Date,
  endDate: Date,
  limit: number = 10
) {
  try {
    const useCase = await createGetTopProductsUseCase();
    const result = await useCase.execute({
      startDate,
      endDate,
      limit,
    });
    return { success: true, data: result.products };
  } catch (error) {
    console.error("[getTopProducts] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch top products",
    };
  }
}

/**
 * Get top customers by revenue
 */
export async function getTopCustomers(
  startDate: Date,
  endDate: Date,
  limit: number = 10
) {
  try {
    const useCase = await createGetTopCustomersUseCase();
    const result = await useCase.execute({
      startDate,
      endDate,
      limit,
    });
    return { success: true, data: result.customers };
  } catch (error) {
    console.error("[getTopCustomers] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch top customers",
    };
  }
}

/**
 * Get order status distribution
 */
export async function getOrderStatusDistribution(
  startDate: Date,
  endDate: Date
) {
  try {
    const useCase = await createGetOrderStatusDistributionUseCase();
    const result = await useCase.execute({
      startDate,
      endDate,
    });
    return { success: true, data: result.distribution };
  } catch (error) {
    console.error("[getOrderStatusDistribution] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch order status distribution",
    };
  }
}
