"use server";

/**
 * Server Actions for Forecast Analytics
 * Sprint 6 - Module 1.5
 *
 * These actions are called from client components to fetch forecast data.
 */

import {
  createGetRevenueForecastUseCase,
  createGetInventoryForecastUseCase,
  createPredictCustomerChurnUseCase,
  createGetTrendAnalysisUseCase,
} from "@/app/api/analytics/forecast/depends";
import { ForecastModel } from "@/core/domain/analytics/forecast";

/**
 * Get revenue forecast for future periods
 */
export async function getRevenueForecast(
  daysAhead: number,
  model: ForecastModel = "simple"
) {
  try {
    const useCase = await createGetRevenueForecastUseCase();
    const result = await useCase.execute({ daysAhead, model });
    return { success: true, data: result.forecasts };
  } catch (error) {
    console.error("[getRevenueForecast] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch revenue forecast",
    };
  }
}

/**
 * Get inventory demand forecast
 */
export async function getInventoryForecast(
  daysAhead: number,
  productId?: number
) {
  try {
    const useCase = await createGetInventoryForecastUseCase();
    const result = await useCase.execute({ daysAhead, productId });
    return { success: true, data: result.forecasts };
  } catch (error) {
    console.error("[getInventoryForecast] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch inventory forecast",
    };
  }
}

/**
 * Get customer churn predictions
 */
export async function predictCustomerChurn(
  customerId?: string,
  riskLevelFilter?: "low" | "medium" | "high"
) {
  try {
    const useCase = await createPredictCustomerChurnUseCase();
    const result = await useCase.execute({ customerId, riskLevelFilter });
    return { success: true, data: result.predictions };
  } catch (error) {
    console.error("[predictCustomerChurn] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to predict customer churn",
    };
  }
}

/**
 * Get trend analysis for a metric
 */
export async function getTrendAnalysis(
  metric: "revenue" | "orders" | "customers",
  period: "week" | "month" | "quarter"
) {
  try {
    const useCase = await createGetTrendAnalysisUseCase();
    const result = await useCase.execute({ metric, period });
    return { success: true, data: result.analysis };
  } catch (error) {
    console.error("[getTrendAnalysis] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch trend analysis",
    };
  }
}
