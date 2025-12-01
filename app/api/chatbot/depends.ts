import { ChatbotRepository } from "@/infrastructure/repositories/ai/chatbot-repo";
import { QueryChatbotUseCase } from "@/core/application/usecases/ai/chatbot/query-chatbot";
import type { ChatbotService } from "@/core/application/interfaces/ai/chatbot-service";

/**
 * Factory function to create chatbot repository instance
 */
const createChatbotRepository = async (): Promise<ChatbotService> => {
  return new ChatbotRepository();
};

/**
 * Use case factory for querying chatbot
 */
export const queryChatbotUseCase = async () => {
  const service = await createChatbotRepository();
  return new QueryChatbotUseCase(service);
};
