/**
 * Dependencies for Survey API
 */

import { SurveyRepository } from "@/infrastructure/repositories/customers/survey-repo";
import type { SurveyService } from "@/core/application/interfaces/customers/survey-service";

// Use Cases
import { CreateSurveyUseCase } from "@/core/application/usecases/customers/care/customer-care/survey/create-survey";
import { GetSurveysUseCase } from "@/core/application/usecases/customers/care/customer-care/survey/get-surveys";
import { SubmitResponseUseCase } from "@/core/application/usecases/customers/care/customer-care/survey/submit-response";
import { CalculateMetricsUseCase } from "@/core/application/usecases/customers/care/customer-care/survey/calculate-metrics";

// Repository Factory
const createSurveyRepository = async (): Promise<SurveyService> => {
  return new SurveyRepository();
};

// Use Case Factories
export const createSurveyUseCase = async () => {
  const service = await createSurveyRepository();
  return new CreateSurveyUseCase(service);
};

export const getSurveysUseCase = async () => {
  const service = await createSurveyRepository();
  return new GetSurveysUseCase(service);
};

export const submitResponseUseCase = async () => {
  const service = await createSurveyRepository();
  return new SubmitResponseUseCase(service);
};

export const calculateMetricsUseCase = async () => {
  const service = await createSurveyRepository();
  return new CalculateMetricsUseCase(service);
};
