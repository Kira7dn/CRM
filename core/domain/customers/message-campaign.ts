/**
 * Domain: Message Campaign
 *
 * Automated message campaigns for customer engagement
 */

import type { TemplatePlatform } from "./message-template";

export type CampaignType =
  | "one_time" // Send once to all recipients
  | "recurring" // Send periodically
  | "triggered"; // Send based on events (order placed, payment due, etc.)

export type CampaignStatus =
  | "draft" // Being prepared
  | "scheduled" // Scheduled for future
  | "running" // Currently sending
  | "paused" // Temporarily stopped
  | "completed" // Finished
  | "cancelled"; // Cancelled

export type CampaignTriggerEvent =
  | "order_placed"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "payment_due"
  | "customer_registered"
  | "feedback_requested"
  | "none"; // For one-time/recurring campaigns

export type RecipientFilter = {
  customerTier?: ("new" | "regular" | "vip" | "premium")[];
  platform?: TemplatePlatform[];
  hasOrders?: boolean;
  lastOrderDays?: number; // Last order within X days
  minOrderValue?: number;
  maxOrderValue?: number;
};

export interface CampaignRecipient {
  customerId: string;
  customerName: string;
  platform: TemplatePlatform;
  contactInfo: string; // Phone number, email, or platform ID
  status: "pending" | "sent" | "failed" | "bounced";
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
}

export interface CampaignStatistics {
  totalRecipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  bounced: number;
  deliveryRate: number; // (delivered / sent) * 100
  readRate: number; // (read / delivered) * 100
}

export interface MessageCampaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;

  // Template and content
  templateId?: string;
  customContent?: string; // If not using template
  platform: TemplatePlatform;

  // Scheduling
  scheduledAt?: Date; // For scheduled campaigns
  startedAt?: Date;
  completedAt?: Date;

  // Trigger configuration
  triggerEvent?: CampaignTriggerEvent;
  triggerDelay?: number; // Delay in minutes after trigger event

  // Recurring configuration
  recurringInterval?: "daily" | "weekly" | "monthly";
  recurringTime?: string; // HH:MM format
  recurringDays?: number[]; // Days of week (0-6) or month (1-31)
  nextRunAt?: Date;

  // Recipients
  recipientFilter?: RecipientFilter;
  recipients: CampaignRecipient[];

  // Statistics
  statistics: CampaignStatistics;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate campaign statistics from recipients
 */
export function calculateCampaignStatistics(
  recipients: CampaignRecipient[]
): CampaignStatistics {
  const total = recipients.length;
  const sent = recipients.filter((r) => r.status === "sent").length;
  const delivered = recipients.filter((r) => r.deliveredAt).length;
  const read = recipients.filter((r) => r.readAt).length;
  const failed = recipients.filter((r) => r.status === "failed").length;
  const bounced = recipients.filter((r) => r.status === "bounced").length;

  const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
  const readRate = delivered > 0 ? (read / delivered) * 100 : 0;

  return {
    totalRecipients: total,
    sent,
    delivered,
    read,
    failed,
    bounced,
    deliveryRate: Math.round(deliveryRate * 100) / 100,
    readRate: Math.round(readRate * 100) / 100,
  };
}

/**
 * Calculate next run time for recurring campaigns
 */
export function calculateNextRunTime(
  campaign: MessageCampaign,
  fromDate: Date = new Date()
): Date | null {
  if (campaign.type !== "recurring" || !campaign.recurringInterval) {
    return null;
  }

  const next = new Date(fromDate);
  const [hours, minutes] = (campaign.recurringTime || "09:00").split(":");

  next.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  switch (campaign.recurringInterval) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;

    case "weekly":
      if (campaign.recurringDays && campaign.recurringDays.length > 0) {
        const currentDay = next.getDay();
        const nextDays = campaign.recurringDays
          .map((d) => (d >= currentDay ? d : d + 7))
          .sort((a, b) => a - b);
        const daysToAdd = nextDays[0] - currentDay || 7;
        next.setDate(next.getDate() + daysToAdd);
      } else {
        next.setDate(next.getDate() + 7);
      }
      break;

    case "monthly":
      if (campaign.recurringDays && campaign.recurringDays.length > 0) {
        const currentDate = next.getDate();
        const nextDates = campaign.recurringDays
          .map((d) => (d >= currentDate ? d : d + 30))
          .sort((a, b) => a - b);
        const targetDate = nextDates[0];
        if (targetDate > currentDate) {
          next.setDate(targetDate);
        } else {
          next.setMonth(next.getMonth() + 1, targetDate);
        }
      } else {
        next.setMonth(next.getMonth() + 1);
      }
      break;
  }

  return next;
}

/**
 * Validate message campaign
 */
export function validateMessageCampaign(
  campaign: Partial<MessageCampaign>
): string[] {
  const errors: string[] = [];

  if (!campaign.name || campaign.name.trim().length === 0) {
    errors.push("Campaign name is required");
  }

  if (!campaign.type) {
    errors.push("Campaign type is required");
  }

  if (!campaign.platform) {
    errors.push("Platform is required");
  }

  if (!campaign.templateId && !campaign.customContent) {
    errors.push("Either template or custom content is required");
  }

  if (campaign.status === "scheduled" && !campaign.scheduledAt) {
    errors.push("Scheduled time is required for scheduled campaigns");
  }

  if (campaign.type === "triggered" && !campaign.triggerEvent) {
    errors.push("Trigger event is required for triggered campaigns");
  }

  if (campaign.type === "recurring") {
    if (!campaign.recurringInterval) {
      errors.push("Recurring interval is required for recurring campaigns");
    }
    if (!campaign.recurringTime) {
      errors.push("Recurring time is required for recurring campaigns");
    }
  }

  if (
    campaign.scheduledAt &&
    new Date(campaign.scheduledAt) < new Date()
  ) {
    errors.push("Scheduled time cannot be in the past");
  }

  return errors;
}

/**
 * Check if campaign can be started
 */
export function canStartCampaign(campaign: MessageCampaign): boolean {
  return (
    campaign.status === "draft" ||
    campaign.status === "scheduled" ||
    campaign.status === "paused"
  );
}

/**
 * Check if campaign can be paused
 */
export function canPauseCampaign(campaign: MessageCampaign): boolean {
  return campaign.status === "running";
}

/**
 * Check if campaign can be cancelled
 */
export function canCancelCampaign(campaign: MessageCampaign): boolean {
  return (
    campaign.status !== "completed" && campaign.status !== "cancelled"
  );
}
