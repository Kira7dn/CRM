/**
 * Forecast Service Interface
 * Sprint 6 - Module 1.5: AI-Powered Forecasting
 */

import type {
  RevenueForecast,
  InventoryForecast,
  ChurnPrediction,
  TrendAnalysis,
  ForecastModel,
} from "@/core/domain/analytics/forecast";

export interface RevenueForecastPayload {
  daysAhead: number;
  model?: ForecastModel;
  startDate?: Date;
}

export interface InventoryForecastPayload {
  productId?: number;
  daysAhead: number;
}

export interface ChurnPredictionPayload {
  customerId?: string;
  riskLevelFilter?: "low" | "medium" | "high";
}

export interface TrendAnalysisPayload {
  metric: "revenue" | "orders" | "customers";
  period: "week" | "month" | "quarter";
  startDate?: Date;
}

export interface ForecastService {
  /**
   * Get revenue forecast for the next N days
   */
  getRevenueForecast(payload: RevenueForecastPayload): Promise<RevenueForecast[]>;

  /**
   * Get inventory demand forecast
   */
  getInventoryForecast(payload: InventoryForecastPayload): Promise<InventoryForecast[]>;

  /**
   * Predict customer churn risk
   */
  predictCustomerChurn(payload: ChurnPredictionPayload): Promise<ChurnPrediction[]>;

  /**
   * Get trend analysis for a metric
   */
  getTrendAnalysis(payload: TrendAnalysisPayload): Promise<TrendAnalysis>;
}
