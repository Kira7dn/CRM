/**
 * Use Case: Calculate Survey Metrics (NPS, CSAT, CES)
 */

import type { Survey } from "@/core/domain/customers/survey";
import {
  calculateNPS,
  calculateCSAT,
  calculateCES,
} from "@/core/domain/customers/survey";
import type { SurveyService } from "@/core/application/interfaces/survey-service";

export interface CalculateMetricsRequest {
  surveyId: string;
}

export interface CalculateMetricsResponse {
  survey: Survey;
  metrics: {
    npsScore?: number;
    promoters?: number;
    passives?: number;
    detractors?: number;
    csatScore?: number;
    csatDistribution?: Record<number, number>;
    cesScore?: number;
    lowEffort?: number;
    mediumEffort?: number;
    highEffort?: number;
  };
}

export class CalculateMetricsUseCase {
  constructor(private surveyService: SurveyService) { }

  async execute(
    request: CalculateMetricsRequest
  ): Promise<CalculateMetricsResponse> {
    // Get survey
    const survey = await this.surveyService.getById(request.surveyId);
    if (!survey) {
      throw new Error("Survey not found");
    }

    // Get all responses
    const responses = await this.surveyService.getResponses(request.surveyId);

    if (responses.length === 0) {
      return {
        survey,
        metrics: {},
      };
    }

    const metrics: any = {};

    // Calculate NPS
    if (survey.type === "nps") {
      const npsScores = responses
        .map((r) => r.npsScore)
        .filter((s): s is number => s !== undefined);

      if (npsScores.length > 0) {
        const npsMetrics = calculateNPS(npsScores);
        metrics.npsScore = npsMetrics.npsScore;
        metrics.promoters = npsMetrics.promoters;
        metrics.passives = npsMetrics.passives;
        metrics.detractors = npsMetrics.detractors;
      }
    }

    // Calculate CSAT
    if (survey.type === "csat") {
      const csatScores = responses
        .map((r) => r.csatScore)
        .filter((s): s is number => s !== undefined);

      if (csatScores.length > 0) {
        const csatMetrics = calculateCSAT(csatScores);
        metrics.csatScore = csatMetrics.csatScore;
        metrics.csatDistribution = csatMetrics.distribution;
      }
    }

    // Calculate CES
    if (survey.type === "ces") {
      const cesScores = responses
        .map((r) => r.cesScore)
        .filter((s): s is number => s !== undefined);

      if (cesScores.length > 0) {
        const cesMetrics = calculateCES(cesScores);
        metrics.cesScore = cesMetrics.cesScore;
        metrics.lowEffort = cesMetrics.lowEffort;
        metrics.mediumEffort = cesMetrics.mediumEffort;
        metrics.highEffort = cesMetrics.highEffort;
      }
    }

    return {
      survey,
      metrics,
    };
  }
}
