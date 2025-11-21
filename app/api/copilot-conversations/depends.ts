import { CopilotConversationRepository } from "@/infrastructure/repositories/copilot-conversation-repo";
import type { CopilotConversationService } from "@/core/application/interfaces/copilot-conversation-service";
import { SaveConversationUseCase } from "@/core/application/usecases/copilot-conversation/save-conversation";
import { GetUserConversationsUseCase } from "@/core/application/usecases/copilot-conversation/get-user-conversations";
import { GetConversationUseCase } from "@/core/application/usecases/copilot-conversation/get-conversation";

// Create repository instance
const createConversationRepository = async (): Promise<CopilotConversationService> => {
  return new CopilotConversationRepository();
};

// Use case factories
export const saveConversationUseCase = async () => {
  const service = await createConversationRepository();
  return new SaveConversationUseCase(service);
};

export const getUserConversationsUseCase = async () => {
  const service = await createConversationRepository();
  return new GetUserConversationsUseCase(service);
};

export const getConversationUseCase = async () => {
  const service = await createConversationRepository();
  return new GetConversationUseCase(service);
};
