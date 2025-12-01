import { CopilotConversationRepository } from "@/infrastructure/repositories/ai/copilot-conversation-repo";
import type { CopilotConversationService } from "@/core/application/interfaces/ai/copilot-conversation-service";
import { SaveConversationUseCase } from "@/core/application/usecases/ai/copilot-conversation/save-conversation";
import { GetUserConversationsUseCase } from "@/core/application/usecases/ai/copilot-conversation/get-user-conversations";
import { GetConversationUseCase } from "@/core/application/usecases/ai/copilot-conversation/get-conversation";

// Create repository instance
export const createConversationRepository = async (): Promise<CopilotConversationService> => {
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
