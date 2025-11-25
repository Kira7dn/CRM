/**
 * Use Case: Submit Survey Response
 */

import type { SurveyResponse, Survey } from "@/core/domain/customers/survey";
import { validateSurveyResponse, extractScore } from "@/core/domain/customers/survey";
import type {
  SurveyService,
  SurveyResponsePayload,
} from "@/core/application/interfaces/survey-service";

export interface SubmitResponseRequest extends SurveyResponsePayload {
  surveyId: string;
}

export interface SubmitResponseResponse {
  response: SurveyResponse;
}

export class SubmitResponseUseCase {
  constructor(private surveyService: SurveyService) { }

  async execute(
    request: SubmitResponseRequest
  ): Promise<SubmitResponseResponse> {
    // Get survey to validate against
    const survey = await this.surveyService.getById(request.surveyId);
    if (!survey) {
      throw new Error("Survey not found");
    }

    // Validate response
    const errors = validateSurveyResponse(request, survey);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Calculate response time if sentAt is provided
    const responseTime = request.sentAt
      ? Math.floor((new Date().getTime() - request.sentAt.getTime()) / 1000)
      : undefined;

    // Submit response
    const response = await this.surveyService.submitResponse({
      ...request,
      surveyName: survey.name,
      respondedAt: new Date(),
      createdAt: new Date(),
      responseTime,
    });

    // Update survey statistics
    await this.surveyService.updateSurveyStats(request.surveyId);

    return { response };
  }
}
