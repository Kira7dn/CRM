/**
 * Dependency Injection Factory for Forecast Analytics
 * Sprint 6 - Module 1.5
 *
 * Provides factory functions to create forecast use case instances with their dependencies.
 */

import { ForecastRepository } from "@/infrastructure/repositories/analytics/forecast-repo";
import { ForecastService } from "@/core/application/interfaces/forecast-service";

// Use Cases
import { GetRevenueForecastUseCase } from "@/core/application/usecases/analytics/forecast/get-revenue-forecast";
import { GetInventoryForecastUseCase } from "@/core/application/usecases/analytics/forecast/get-inventory-forecast";
import { PredictCustomerChurnUseCase } from "@/core/application/usecases/analytics/forecast/predict-customer-churn";
import { GetTrendAnalysisUseCase } from "@/core/application/usecases/analytics/forecast/get-trend-analysis";

/**
 * Create repository instance
 */
const createForecastRepository = async (): Promise<ForecastService> => {
  return new ForecastRepository();
};

/**
 * Create GetRevenueForecast use case
 */
export const createGetRevenueForecastUseCase = async () => {
  const service = await createForecastRepository();
  return new GetRevenueForecastUseCase(service);
};

/**
 * Create GetInventoryForecast use case
 */
export const createGetInventoryForecastUseCase = async () => {
  const service = await createForecastRepository();
  return new GetInventoryForecastUseCase(service);
};

/**
 * Create PredictCustomerChurn use case
 */
export const createPredictCustomerChurnUseCase = async () => {
  const service = await createForecastRepository();
  return new PredictCustomerChurnUseCase(service);
};

/**
 * Create GetTrendAnalysis use case
 */
export const createGetTrendAnalysisUseCase = async () => {
  const service = await createForecastRepository();
  return new GetTrendAnalysisUseCase(service);
};
