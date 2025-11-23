'use server';

import {
  saveConversationUseCase,
  getUserConversationsUseCase,
  getConversationUseCase,
} from '@/app/api/copilot-conversations/depends';
import type { CopilotMessage } from '@/core/domain/copilot-conversation';
import { generateCopilotConversationId } from '@/core/domain/copilot-conversation';

/**
 * Save conversation to database
 */
export async function saveConversationAction(data: {
  userId: string;
  messages: CopilotMessage[];
  conversationId?: string;
  title?: string;
}) {
  try {
    const useCase = await saveConversationUseCase();

    const result = await useCase.execute({
      id: data.conversationId || generateCopilotConversationId(),
      userId: data.userId,
      messages: data.messages,
      title: data.title,
      status: 'active',
    });

    return result.conversation;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw new Error('Failed to save conversation');
  }
}

/**
 * Get user's conversation history
 */
export async function getUserConversationsAction(userId: string) {
  try {
    const useCase = await getUserConversationsUseCase();
    const result = await useCase.execute({ userId });
    return result.conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

/**
 * Get specific conversation
 */
export async function getConversationAction(conversationId: string) {
  try {
    const useCase = await getConversationUseCase();
    const result = await useCase.execute({ conversationId });
    return result.conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}
