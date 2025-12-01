import type { ChatMessage, MessageIntent } from "@/core/domain/ai/chatbot";
import {
  classifyIntent,
  generateMessageId,
  generateConversationId,
  validateChatMessage,
} from "@/core/domain/ai/chatbot";
import type { ChatbotService, ChatbotQueryRequest, ChatbotQueryResponse } from "@/core/application/interfaces/ai/chatbot-service";

/**
 * Query chatbot request interface
 */
export interface QueryChatbotRequest extends ChatbotQueryRequest {}

/**
 * Query chatbot response interface
 */
export interface QueryChatbotResponse extends ChatbotQueryResponse {}

/**
 * Use case for querying the chatbot
 */
export class QueryChatbotUseCase {
  constructor(private chatbotService: ChatbotService) {}

  async execute(request: QueryChatbotRequest): Promise<QueryChatbotResponse> {
    // Validate request
    if (!request.message || request.message.trim().length === 0) {
      throw new Error("Message content is required");
    }

    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // Classify intent
    const { intent, confidence } = classifyIntent(request.message);

    // Use chatbot service to generate response
    const response = await this.chatbotService.query({
      ...request,
      useAI: request.useAI ?? false, // Default to rule-based
    });

    return response;
  }
}
