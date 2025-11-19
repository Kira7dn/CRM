/**
 * Predict Customer Churn Use Case
 * Sprint 6 - Module 1.5
 *
 * Identifies at-risk customers using RFM analysis and behavioral patterns.
 */

import { ChurnPrediction } from "@/core/domain/analytics/forecast";
import {
  ForecastService,
  ChurnPredictionPayload,
} from "@/core/application/interfaces/forecast-service";

export interface PredictCustomerChurnRequest extends ChurnPredictionPayload {}

export interface PredictCustomerChurnResponse {
  predictions: ChurnPrediction[];
}

export class PredictCustomerChurnUseCase {
  constructor(private forecastService: ForecastService) {}

  async execute(request: PredictCustomerChurnRequest): Promise<PredictCustomerChurnResponse> {
    // Get churn predictions from service
    const predictions = await this.forecastService.predictCustomerChurn(request);

    return { predictions };
  }
}
