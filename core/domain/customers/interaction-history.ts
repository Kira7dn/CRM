/**
 * Domain: Interaction History
 *
 * Track all customer interactions across platforms
 */

import { TemplatePlatform } from "./message-template";


export type InteractionType =
  | "message_sent" // Outbound message
  | "message_received" // Inbound message
  | "call_made" // Outbound call
  | "call_received" // Inbound call
  | "email_sent"
  | "email_received"
  | "ticket_created"
  | "ticket_updated"
  | "order_placed"
  | "order_updated"
  | "feedback_received"
  | "campaign_message"
  | "chatbot_conversation"
  | "note_added";

export type InteractionChannel = TemplatePlatform | "phone" | "in_person" | "system";

export type SentimentScore = "positive" | "neutral" | "negative" | "mixed";

export interface InteractionMetadata {
  // For messages
  messageId?: string;
  templateId?: string;
  campaignId?: string;

  // For tickets
  ticketId?: string;
  ticketStatus?: string;

  // For orders
  orderId?: string;
  orderValue?: number;

  // For calls
  callDuration?: number; // in seconds
  callRecordingUrl?: string;

  // For emails
  emailSubject?: string;
  emailId?: string;

  // Sentiment analysis
  sentiment?: SentimentScore;
  sentimentScore?: number; // -1 to 1

  // Additional context
  tags?: string[];
  attachments?: string[];
}

export interface InteractionHistory {
  id: string;
  customerId: string;
  customerName: string;

  // Interaction details
  type: InteractionType;
  channel: InteractionChannel;
  direction: "inbound" | "outbound";

  // Content
  subject?: string;
  content: string;
  contentPreview?: string; // First 100 chars

  // Metadata
  metadata?: InteractionMetadata;

  // Staff involved
  staffId?: string;
  staffName?: string;

  // Timing
  occurredAt: Date;
  duration?: number; // Duration in seconds for calls/chats

  // Follow-up
  requiresFollowUp: boolean;
  followUpAt?: Date;
  followedUpAt?: Date;

  // System metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate content preview from full content
 */
export function generateContentPreview(
  content: string,
  maxLength: number = 100
): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength).trim() + "...";
}

/**
 * Calculate sentiment score from text (simple rule-based)
 */
export function calculateSentiment(text: string): {
  sentiment: SentimentScore;
  score: number;
} {
  const lowerText = text.toLowerCase();

  // Positive keywords
  const positiveWords = [
    "tốt",
    "tuyệt",
    "hài lòng",
    "cảm ơn",
    "xuất sắc",
    "tốt lắm",
    "rất tốt",
    "ok",
    "được",
    "ổn",
  ];
  const negativeWords = [
    "tệ",
    "kém",
    "không tốt",
    "thất vọng",
    "tồi",
    "không hài lòng",
    "chậm",
    "không",
    "lỗi",
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });

  const totalCount = positiveCount + negativeCount;
  if (totalCount === 0) {
    return { sentiment: "neutral", score: 0 };
  }

  const score = (positiveCount - negativeCount) / totalCount;

  let sentiment: SentimentScore;
  if (positiveCount > 0 && negativeCount > 0) {
    sentiment = "mixed";
  } else if (score > 0.3) {
    sentiment = "positive";
  } else if (score < -0.3) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }

  return { sentiment, score };
}

/**
 * Validate interaction history
 */
export function validateInteractionHistory(
  interaction: Partial<InteractionHistory>
): string[] {
  const errors: string[] = [];

  if (!interaction.customerId) {
    errors.push("Customer ID is required");
  }

  if (!interaction.type) {
    errors.push("Interaction type is required");
  }

  if (!interaction.channel) {
    errors.push("Channel is required");
  }

  if (!interaction.direction) {
    errors.push("Direction is required");
  }

  if (!interaction.content || interaction.content.trim().length === 0) {
    errors.push("Content is required");
  }

  if (!interaction.occurredAt) {
    errors.push("Occurred date is required");
  }

  return errors;
}

/**
 * Check if interaction needs follow-up
 */
export function needsFollowUp(interaction: InteractionHistory): boolean {
  if (interaction.requiresFollowUp && !interaction.followedUpAt) {
    if (interaction.followUpAt) {
      return new Date() >= interaction.followUpAt;
    }
    return true;
  }
  return false;
}

/**
 * Get interaction summary for customer
 */
export interface CustomerInteractionSummary {
  customerId: string;
  totalInteractions: number;
  lastInteractionAt?: Date;
  lastInteractionType?: InteractionType;
  averageSentiment: number;
  requiresFollowUp: number;
  byChannel: Record<InteractionChannel, number>;
  byType: Record<InteractionType, number>;
}
