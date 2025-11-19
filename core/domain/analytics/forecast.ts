/**
 * Domain entities for AI-Powered Forecasting
 * Sprint 6 - Module 1.5
 */

export interface RevenueForecast {
  forecastDate: Date;
  predictedRevenue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  actualRevenue?: number; // For historical comparison
  accuracy?: number; // Percentage accuracy if actual is available
}

export interface InventoryForecast {
  productId: number;
  productName: string;
  currentStock?: number;
  predictedDemand: number; // Next 7/30 days
  recommendedRestock: number;
  daysUntilStockout?: number;
  forecastPeriodDays: number;
}

export interface ChurnPrediction {
  customerId: string;
  customerName: string;
  churnProbability: number; // 0-1
  riskLevel: "low" | "medium" | "high";
  factors: string[]; // "No purchase in 60 days", "Decreased order frequency", etc.
  recommendedAction: string;
  lastOrderDate?: Date;
  daysSinceLastOrder?: number;
  totalOrders?: number;
  totalRevenue?: number;
}

export interface TrendAnalysis {
  metric: "revenue" | "orders" | "customers";
  period: "week" | "month" | "quarter";
  trend: "up" | "down" | "stable";
  changePercent: number;
  currentValue: number;
  previousValue: number;
  insights: string[];
  dataPoints: {
    date: Date;
    value: number;
  }[];
}

export type ForecastModel = "simple" | "ml";

export interface ForecastAccuracy {
  model: ForecastModel;
  metric: string;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  mae: number; // Mean Absolute Error
}

/**
 * Validation helpers
 */
export function validateRevenueForecast(forecast: Partial<RevenueForecast>): string[] {
  const errors: string[] = [];

  if (!forecast.forecastDate) {
    errors.push("Forecast date is required");
  }

  if (forecast.predictedRevenue === undefined || forecast.predictedRevenue < 0) {
    errors.push("Predicted revenue must be a non-negative number");
  }

  if (forecast.confidenceInterval) {
    if (forecast.confidenceInterval.lower < 0) {
      errors.push("Confidence interval lower bound must be non-negative");
    }
    if (forecast.confidenceInterval.upper < forecast.confidenceInterval.lower) {
      errors.push("Confidence interval upper bound must be greater than lower bound");
    }
  }

  return errors;
}

export function validateChurnPrediction(prediction: Partial<ChurnPrediction>): string[] {
  const errors: string[] = [];

  if (!prediction.customerId) {
    errors.push("Customer ID is required");
  }

  if (!prediction.customerName) {
    errors.push("Customer name is required");
  }

  if (prediction.churnProbability === undefined ||
      prediction.churnProbability < 0 ||
      prediction.churnProbability > 1) {
    errors.push("Churn probability must be between 0 and 1");
  }

  if (!prediction.riskLevel || !["low", "medium", "high"].includes(prediction.riskLevel)) {
    errors.push("Risk level must be low, medium, or high");
  }

  return errors;
}

/**
 * Calculate risk level from churn probability
 */
export function calculateRiskLevel(churnProbability: number): "low" | "medium" | "high" {
  if (churnProbability >= 0.7) return "high";
  if (churnProbability >= 0.4) return "medium";
  return "low";
}

/**
 * Calculate trend direction from change percentage
 */
export function calculateTrendDirection(changePercent: number): "up" | "down" | "stable" {
  if (changePercent > 5) return "up";
  if (changePercent < -5) return "down";
  return "stable";
}
