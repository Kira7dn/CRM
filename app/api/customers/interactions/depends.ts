/**
 * Dependencies for Interaction History API
 */

import { InteractionHistoryRepository } from "@/infrastructure/repositories/customers/interaction-history-repo";
import type { InteractionHistoryService } from "@/core/application/interfaces/customers/interaction-history-service";

// Use Cases
import { CreateInteractionUseCase } from "@/core/application/usecases/customers/care/customer-care/interaction-history/create-interaction";
import { GetAllInteractionsUseCase } from "@/core/application/usecases/customers/care/customer-care/interaction-history/get-all-interactions";
import { GetCustomerInteractionsUseCase } from "@/core/application/usecases/customers/care/customer-care/interaction-history/get-customer-interactions";
import { GetCustomerSummaryUseCase } from "@/core/application/usecases/customers/care/customer-care/interaction-history/get-customer-summary";
import { MarkFollowedUpUseCase } from "@/core/application/usecases/customers/care/customer-care/interaction-history/mark-followed-up";

// Repository Factory
const createInteractionHistoryRepository =
  async (): Promise<InteractionHistoryService> => {
    return new InteractionHistoryRepository();
  };

// Use Case Factories
export const createInteractionUseCase = async () => {
  const service = await createInteractionHistoryRepository();
  return new CreateInteractionUseCase(service);
};

export const getAllInteractionsUseCase = async () => {
  const service = await createInteractionHistoryRepository();
  return new GetAllInteractionsUseCase(service);
};

export const getCustomerInteractionsUseCase = async () => {
  const service = await createInteractionHistoryRepository();
  return new GetCustomerInteractionsUseCase(service);
};

export const getCustomerSummaryUseCase = async () => {
  const service = await createInteractionHistoryRepository();
  return new GetCustomerSummaryUseCase(service);
};

export const markFollowedUpUseCase = async () => {
  const service = await createInteractionHistoryRepository();
  return new MarkFollowedUpUseCase(service);
};
