import type { Conversation } from "@/core/domain/messaging/conversation";

export interface ConversationPayload extends Partial<Conversation> {}

export interface ConversationService {
  getAll(): Promise<Conversation[]>;
  getById(id: string): Promise<Conversation | null>;
  create(payload: ConversationPayload): Promise<Conversation>;
  update(payload: ConversationPayload): Promise<Conversation | null>;
  delete(id: string): Promise<boolean>;

  // Legacy methods (backward compatibility)
  findActiveByCustomer(customerId: string): Promise<Conversation[]>;
  findByCustomerAndPlatform(customerId: string, platform: string): Promise<Conversation | null>;
  assignToAgent(conversationId: string, agentId: number): Promise<void>;

  // NEW: Improved methods for multi-channel support
  findOpenByChannelAndCustomer(channelId: string, senderPlatformId: string): Promise<Conversation | null>;

  // Shared methods
  updateLastMessageTime(conversationId: string, time: Date): Promise<void>;
  updateStatus(conversationId: string, status: string): Promise<void>;
}
