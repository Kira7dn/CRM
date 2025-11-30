import type { Platform } from "./message";

/**
 * Conversation status types
 */
export type ConversationStatus = "open" | "pending" | "closed";

/**
 * Conversation priority levels
 */
export type ConversationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Conversation domain entity
 * Represents a messaging thread with a customer on a specific platform
 */
export interface Conversation {
  id: string; // MongoDB ObjectId as string

  // Channel and customer identification (NEW - improved design)
  channelId: string; // Page ID / Zalo OA ID / TikTok Business Account
  contactId?: string; // Mapped customer ID in CRM (future: replace customerId)
  customerId: string; // DEPRECATED: Use contactId. Kept for backward compatibility

  platform: Platform;
  platformConversationId?: string; // External platform conversation/thread ID

  // Status and priority
  status: ConversationStatus;
  priority?: ConversationPriority; // Priority level for routing

  // Agent assignment (NEW - improved design)
  agentId?: string; // CRM User ID (string) of assigned agent
  assignedTo?: number; // DEPRECATED: Use agentId. Kept for backward compatibility
  assignedGroup?: string; // Team assignment (e.g., "support", "sales", "bot")

  // Chat management (NEW)
  unreadCount?: number; // Number of unread messages for agent
  isBotActive?: boolean; // Is chatbot handling this conversation?

  // Tags and metadata
  tags?: string[]; // Labels for categorization (e.g., "support", "sales", "complaint")
  metadata?: Record<string, any>; // Additional platform-specific data

  // Timestamps (NEW - improved tracking)
  lastIncomingMessageAt?: Date; // Last message from customer
  lastOutgoingMessageAt?: Date; // Last message from agent/page
  lastMessageAt: Date; // Most recent message (for sorting)

  createdAt: Date;
  updatedAt?: Date;
  closedAt?: Date; // Timestamp when conversation was closed
  resolvedBy?: string; // User ID who resolved/closed (changed to string)
}

/**
 * Validation function for Conversation entity
 */
export function validateConversation(data: Partial<Conversation>): string[] {
  const errors: string[] = [];

  // Require either channelId (new) for proper multi-channel support
  if (!data.channelId || data.channelId.trim().length === 0) {
    errors.push('channelId is required');
  }

  // Require customerId (will be replaced by contactId in future)
  if (!data.customerId || data.customerId.trim().length === 0) {
    errors.push('Customer ID is required');
  }

  if (!data.platform) {
    errors.push('Platform is required');
  }

  const validPlatforms: Platform[] = ["facebook", "zalo", "tiktok", "website"];
  if (data.platform && !validPlatforms.includes(data.platform)) {
    errors.push(`Invalid platform. Must be one of: ${validPlatforms.join(", ")}`);
  }

  if (!data.status) {
    errors.push('Status is required');
  }

  const validStatuses: ConversationStatus[] = ["open", "pending", "closed"];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  if (data.priority) {
    const validPriorities: ConversationPriority[] = ["low", "normal", "high", "urgent"];
    if (!validPriorities.includes(data.priority)) {
      errors.push(`Invalid priority. Must be one of: ${validPriorities.join(", ")}`);
    }
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  if (data.tags && data.tags.some(tag => typeof tag !== 'string')) {
    errors.push('All tags must be strings');
  }

  if (!data.lastMessageAt) {
    errors.push('Last message date is required');
  }

  if (!data.createdAt) {
    errors.push('Created date is required');
  }

  // If conversation is closed, closedAt should be set
  if (data.status === 'closed' && data.closedAt && data.createdAt) {
    if (new Date(data.closedAt) < new Date(data.createdAt)) {
      errors.push('Closed date cannot be before created date');
    }
  }

  return errors;
}
