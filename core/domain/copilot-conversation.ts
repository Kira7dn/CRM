/**
 * CopilotKit Conversation History Domain Model
 * Simplified model to store CopilotKit conversation messages
 */

export type CopilotMessageRole = "user" | "assistant" | "system";

/**
 * Single message in a CopilotKit conversation
 */
export interface CopilotMessage {
  id: string;
  role: CopilotMessageRole;
  content: string;
  createdAt: Date;
}

/**
 * CopilotKit conversation entity
 */
export interface CopilotConversation {
  id: string;
  userId: string;
  title?: string; // Auto-generated from first message
  messages: CopilotMessage[];
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate conversation ID
 */
export function generateCopilotConversationId(): string {
  return `copilot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate message ID
 */
export function generateCopilotMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate conversation title from first user message
 */
export function generateConversationTitle(firstMessage: string): string {
  const maxLength = 50;
  const cleaned = firstMessage.trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength) + "...";
}

/**
 * Validation for CopilotConversation
 */
export function validateCopilotConversation(data: Partial<CopilotConversation>): string[] {
  const errors: string[] = [];

  if (!data.userId || data.userId.trim().length === 0) {
    errors.push("User ID is required");
  }

  if (!data.messages || data.messages.length === 0) {
    errors.push("Conversation must have at least one message");
  }

  if (data.messages) {
    data.messages.forEach((msg, index) => {
      if (!msg.role || !["user", "assistant", "system"].includes(msg.role)) {
        errors.push(`Invalid role for message ${index}`);
      }
      if (!msg.content || msg.content.trim().length === 0) {
        errors.push(`Message ${index} content is required`);
      }
    });
  }

  return errors;
}
