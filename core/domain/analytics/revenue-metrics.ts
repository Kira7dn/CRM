/**
 * Domain Entity: Revenue Analytics Metrics
 *
 * Contains all business entities and types for revenue analytics.
 * This is a pure domain layer with no external dependencies.
 */

import { CustomerTier } from "../managements/customer";

/**
 * Date range for filtering analytics data
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Time granularity for time-series data
 */
export type TimeGranularity = "day" | "week" | "month" | "quarter" | "year";

/**
 * Core revenue metrics for a given period
 */
export interface RevenueMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  cancelRate: number;
  returnRate: number;
  period: DateRange;
  comparisonPeriod?: ComparisonMetrics;
}

/**
 * Comparison metrics with previous period
 */
export interface ComparisonMetrics {
  revenue: number;
  orders: number;
  changePercent: number;
  revenueChangePercent: number;
  ordersChangePercent: number;
  aovChangePercent: number;
}

/**
 * Top-performing product by revenue
 */
export interface TopProduct {
  productId: number;
  productName: string;
  revenue: number;
  orderCount: number;
  quantity: number;
  image?: string;
}

/**
 * Top customer by revenue
 */
export interface TopCustomer {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  orderCount: number;
  tier: CustomerTier;
  phone?: string;
  platform?: string;
}

/**
 * Revenue time-series data point
 */
export interface RevenueTimeSeries {
  date: Date;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

/**
 * Order status distribution
 */
export interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
  revenue: number;
}

/**
 * Validation rules for analytics queries
 */
export function validateDateRange(dateRange: DateRange): string[] {
  const errors: string[] = [];

  if (!dateRange.startDate) {
    errors.push("Start date is required");
  }

  if (!dateRange.endDate) {
    errors.push("End date is required");
  }

  if (dateRange.startDate && dateRange.endDate) {
    if (dateRange.startDate > dateRange.endDate) {
      errors.push("Start date must be before end date");
    }

    // Limit to 1 year for performance
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const diff = dateRange.endDate.getTime() - dateRange.startDate.getTime();
    if (diff > oneYearMs) {
      errors.push("Date range cannot exceed 1 year");
    }
  }

  return errors;
}

/**
 * Validate time granularity
 */
export function validateTimeGranularity(granularity: string): boolean {
  return ["day", "week", "month", "quarter", "year"].includes(granularity);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate average order value
 */
export function calculateAOV(totalRevenue: number, totalOrders: number): number {
  if (totalOrders === 0) return 0;
  return totalRevenue / totalOrders;
}
