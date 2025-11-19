/**
 * Interface: Survey Service
 */

import type { Survey, SurveyResponse, SurveyType } from "@/core/domain/customer-care/survey";

export interface SurveyPayload extends Partial<Survey> {}

export interface SurveyResponsePayload extends Partial<SurveyResponse> {}

export interface SurveyFilters {
  type?: SurveyType;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface SurveyService {
  // Survey CRUD
  create(payload: SurveyPayload): Promise<Survey>;
  getAll(filters?: SurveyFilters): Promise<Survey[]>;
  getById(id: string): Promise<Survey | null>;
  update(id: string, payload: Partial<SurveyPayload>): Promise<Survey | null>;
  delete(id: string): Promise<boolean>;

  // Survey responses
  submitResponse(payload: SurveyResponsePayload): Promise<SurveyResponse>;
  getResponses(surveyId: string, limit?: number): Promise<SurveyResponse[]>;
  getResponseById(responseId: string): Promise<SurveyResponse | null>;

  // Analytics
  updateSurveyStats(surveyId: string): Promise<Survey | null>;
}
