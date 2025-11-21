"use server";

/**
 * Server Actions for Customer Analytics
 *
 * These actions are called from client components to fetch customer analytics data.
 */

import {
  createGetCustomerMetricsUseCase,
  createGetCustomerSegmentationUseCase,
  createGetPurchasePatternsUseCase,
  createGetChurnRiskCustomersUseCase,
  createGetCohortRetentionUseCase,
  createGetRFMSegmentationUseCase,
} from "@/app/api/analytics/customer/depends";
import { ChurnRisk } from "@/core/domain/analytics/customer-metrics";

/**
 * Get customer metrics for a given period
 */
export async function getCustomerMetrics(startDate: Date, endDate: Date) {
  try {
    const useCase = await createGetCustomerMetricsUseCase();
    const result = await useCase.execute({ startDate, endDate });
    return { success: true, data: result.metrics };
  } catch (error) {
    console.error("[getCustomerMetrics] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch customer metrics",
    };
  }
}

/**
 * Get customer segmentation by tier
 */
export async function getCustomerSegmentation(startDate: Date, endDate: Date) {
  try {
    const useCase = await createGetCustomerSegmentationUseCase();
    const result = await useCase.execute({ startDate, endDate });
    return { success: true, data: result.segments };
  } catch (error) {
    console.error("[getCustomerSegmentation] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch customer segmentation",
    };
  }
}

/**
 * Get purchase patterns for customers
 */
export async function getPurchasePatterns(customerId?: string, limit: number = 100) {
  try {
    const useCase = await createGetPurchasePatternsUseCase();
    const result = await useCase.execute({ customerId, limit });
    return { success: true, data: result.patterns };
  } catch (error) {
    console.error("[getPurchasePatterns] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch purchase patterns",
    };
  }
}

/**
 * Get customers at risk of churning
 */
export async function getChurnRiskCustomers(riskLevel?: ChurnRisk, limit: number = 50) {
  try {
    const useCase = await createGetChurnRiskCustomersUseCase();
    const result = await useCase.execute({ riskLevel, limit });
    return { success: true, data: result.customers };
  } catch (error) {
    console.error("[getChurnRiskCustomers] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch churn risk customers",
    };
  }
}

/**
 * Get cohort retention analysis
 */
export async function getCohortRetention(cohortStartDate: Date, periods: number = 12) {
  try {
    const useCase = await createGetCohortRetentionUseCase();
    const result = await useCase.execute({ cohortStartDate, periods });
    return { success: true, data: result.cohort };
  } catch (error) {
    console.error("[getCohortRetention] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch cohort retention",
    };
  }
}

/**
 * Get RFM segmentation
 */
export async function getRFMSegmentation(limit: number = 100) {
  try {
    const useCase = await createGetRFMSegmentationUseCase();
    const result = await useCase.execute({ limit });
    return { success: true, data: result.segments };
  } catch (error) {
    console.error("[getRFMSegmentation] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch RFM segmentation",
    };
  }
}
