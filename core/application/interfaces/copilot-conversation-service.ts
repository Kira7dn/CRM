import type { CopilotConversation, CopilotMessage } from "@/core/domain/copilot-conversation";

/**
 * Payload for creating/updating conversations
 */
export interface CopilotConversationPayload extends Partial<CopilotConversation> {}

/**
 * CopilotKit Conversation Service Interface
 */
export interface CopilotConversationService {
  /**
   * Save a conversation (create or update)
   */
  saveConversation(conversation: CopilotConversationPayload): Promise<CopilotConversation>;

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): Promise<CopilotConversation | null>;

  /**
   * Get all conversations for a user
   */
  getUserConversations(userId: string, limit?: number): Promise<CopilotConversation[]>;

  /**
   * Add messages to an existing conversation
   */
  addMessages(conversationId: string, messages: CopilotMessage[]): Promise<CopilotConversation | null>;

  /**
   * Archive a conversation
   */
  archiveConversation(conversationId: string): Promise<boolean>;

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): Promise<boolean>;
}
