/**
 * Use Case: Create Survey
 */

import type { Survey } from "@/core/domain/customer-care/survey";
import { validateSurvey } from "@/core/domain/customer-care/survey";
import type {
  SurveyService,
  SurveyPayload,
} from "@/core/application/interfaces/survey-service";

export interface CreateSurveyRequest extends SurveyPayload {}

export interface CreateSurveyResponse {
  survey: Survey;
}

export class CreateSurveyUseCase {
  constructor(private surveyService: SurveyService) {}

  async execute(request: CreateSurveyRequest): Promise<CreateSurveyResponse> {
    // Validation
    const errors = validateSurvey(request);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Initialize statistics
    const survey = await this.surveyService.create({
      ...request,
      totalSent: 0,
      totalResponses: 0,
      responseRate: 0,
      status: request.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { survey };
  }
}
