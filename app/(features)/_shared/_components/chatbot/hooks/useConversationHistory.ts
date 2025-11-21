'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCopilotContext } from '@copilotkit/react-core';
import type { CopilotConversation, CopilotMessage } from '@/core/domain/copilot-conversation';
import { generateCopilotMessageId } from '@/core/domain/copilot-conversation';
import {
  saveConversationAction,
  getUserConversationsAction,
  getConversationAction,
} from '../actions/conversation-actions';

export function useConversationHistory(userId: string) {
  const context = useCopilotContext();
  const [conversations, setConversations] = useState<CopilotConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    // Try to resume from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`copilot_conversation_${userId}`);
      return stored || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Save conversation ID to localStorage for session persistence
  useEffect(() => {
    if (currentConversationId && typeof window !== 'undefined') {
      localStorage.setItem(`copilot_conversation_${userId}`, currentConversationId);
    }
  }, [currentConversationId, userId]);

  // Load user's conversation history
  const loadConversations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const userConversations = await getUserConversationsAction(userId);
      setConversations(userConversations);

      // Auto-resume last active conversation if exists
      if (userConversations.length > 0 && !currentConversationId) {
        const lastConversation = userConversations[0]; // Most recent conversation
        setCurrentConversationId(lastConversation.id);

        // Note: We could also restore messages to CopilotKit context here
        // but CopilotKit maintains its own message state
        // The conversation is saved, we just track the ID for saving new messages
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentConversationId]);

  // Load conversations on mount and resume session
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Save current conversation
  const saveCurrentConversation = useCallback(async () => {
    if (!userId) {
      return null;
    }

    // CopilotKit context type không expose trực tiếp trường messages, nên ta đọc an toàn qua any
    const anyContext = context as any;
    const rawMessages = (anyContext?.visibleMessages || anyContext?.messages || []) as Array<{
      id?: string;
      role: string;
      content: unknown;
    }>;

    if (!rawMessages || rawMessages.length === 0) {
      return null;
    }

    // Convert CopilotKit messages to our domain format
    const messages: CopilotMessage[] = rawMessages.map((msg: {
      id?: string;
      role: string;
      content: unknown;
    }) => ({
      id: msg.id || generateCopilotMessageId(),
      role: msg.role as 'user' | 'assistant' | 'system',
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      createdAt: new Date(),
    }));

    try {
      const conversation = await saveConversationAction({
        userId,
        messages,
        conversationId: currentConversationId || undefined,
      });

      setCurrentConversationId(conversation.id);
      await loadConversations(); // Refresh list
      return conversation;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      return null;
    }
  }, [userId, context, currentConversationId, loadConversations]);

  // Load a specific conversation
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        const conversation = await getConversationAction(conversationId);
        if (conversation) {
          setCurrentConversationId(conversation.id);
          // You can also set the messages in CopilotKit context here if needed
          return conversation;
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
      return null;
    },
    []
  );

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`copilot_conversation_${userId}`);
    }
    // Clear CopilotKit messages if you have access to that API
  }, [userId]);

  return {
    conversations,
    currentConversationId,
    loading,
    saveCurrentConversation,
    loadConversation,
    startNewConversation,
    refreshConversations: loadConversations,
  };
}
