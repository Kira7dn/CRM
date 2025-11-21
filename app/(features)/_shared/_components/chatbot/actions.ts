"use server";

import { queryChatbotUseCase } from "@/app/api/chatbot/depends";

/**
 * Send a message to the chatbot and get response
 */
export async function sendChatMessageAction(
  message: string,
  userId: string,
  conversationId?: string,
  useAI: boolean = false
) {
  try {
    const useCase = await queryChatbotUseCase();
    const result = await useCase.execute({
      message,
      userId,
      conversationId,
      useAI,
    });

    // Serialize dates for JSON transport
    return JSON.parse(JSON.stringify(result));
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    return {
      error: error.message || "Failed to send message",
    };
  }
}
