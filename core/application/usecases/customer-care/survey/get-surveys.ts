/**
 * Use Case: Get All Surveys
 */

import type { Survey } from "@/core/domain/customers/survey";
import type {
  SurveyService,
  SurveyFilters,
} from "@/core/application/interfaces/survey-service";

export interface GetSurveysRequest {
  filters?: SurveyFilters;
}

export interface GetSurveysResponse {
  surveys: Survey[];
  total: number;
}

export class GetSurveysUseCase {
  constructor(private surveyService: SurveyService) { }

  async execute(request: GetSurveysRequest = {}): Promise<GetSurveysResponse> {
    const surveys = await this.surveyService.getAll(request.filters);

    return {
      surveys,
      total: surveys.length,
    };
  }
}
