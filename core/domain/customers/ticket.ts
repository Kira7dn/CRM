/**
 * Ticket priority levels
 */
export type TicketPriority = "low" | "medium" | "high" | "urgent";

/**
 * Ticket status types
 */
export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed" | "cancelled";

/**
 * Ticket category types
 */
export type TicketCategory =
  | "order_issue"
  | "product_inquiry"
  | "payment_issue"
  | "delivery_issue"
  | "refund_request"
  | "complaint"
  | "feedback"
  | "other";

/**
 * Ticket source (where the ticket came from)
 */
export type TicketSource = "zalo" | "facebook" | "telegram" | "phone" | "email" | "website" | "internal";

/**
 * Ticket comment/activity
 */
export interface TicketComment {
  id: string;
  userId: string; // Admin/Staff user ID
  userName: string; // Cached for display
  content: string;
  isInternal: boolean; // Internal notes (not visible to customer)
  createdAt: Date;
}

/**
 * Support Ticket domain entity
 */
export interface Ticket {
  id: string; // MongoDB ObjectId
  ticketNumber: string; // Human-readable ticket number (e.g., "TKT-20250119-001")

  // Customer information
  customerId: string; // Reference to Customer.id
  customerName?: string; // Cached for display

  // Ticket details
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;

  // Assignment
  assignedTo?: string; // Staff/Admin user ID
  assignedToName?: string; // Cached for display

  // Related entities
  orderId?: number; // Optional reference to related order

  // Resolution
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string; // User ID who resolved

  // Activity
  comments: TicketComment[];

  // Metadata
  tags: string[]; // For categorization
  attachments?: string[]; // URLs to attached files (S3)

  // SLA tracking
  responseTime?: number; // Minutes until first response
  resolutionTime?: number; // Minutes from creation to resolution

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

/**
 * Generate ticket number
 * Format: TKT-YYYYMMDD-XXX
 */
export function generateTicketNumber(date: Date = new Date(), sequenceNumber: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(sequenceNumber).padStart(3, '0');

  return `TKT-${year}${month}${day}-${sequence}`;
}

/**
 * Calculate response time in minutes
 */
export function calculateResponseTime(createdAt: Date, firstCommentAt: Date): number {
  return Math.floor((firstCommentAt.getTime() - createdAt.getTime()) / (1000 * 60));
}

/**
 * Calculate resolution time in minutes
 */
export function calculateResolutionTime(createdAt: Date, resolvedAt: Date): number {
  return Math.floor((resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60));
}

/**
 * Check if ticket is overdue (based on priority SLA)
 */
export function isTicketOverdue(ticket: Ticket, currentTime: Date = new Date()): boolean {
  if (ticket.status === "resolved" || ticket.status === "closed") {
    return false;
  }

  // SLA in hours by priority
  const slaDuration: Record<TicketPriority, number> = {
    urgent: 4,   // 4 hours
    high: 8,     // 8 hours
    medium: 24,  // 24 hours
    low: 48      // 48 hours
  };

  const slaHours = slaDuration[ticket.priority];
  const elapsedHours = (currentTime.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);

  return elapsedHours > slaHours;
}

/**
 * Get ticket status badge color
 */
export function getTicketStatusColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    open: "red",
    in_progress: "blue",
    waiting_customer: "yellow",
    resolved: "green",
    closed: "gray",
    cancelled: "gray"
  };

  return colors[status];
}

/**
 * Get ticket priority badge color
 */
export function getTicketPriorityColor(priority: TicketPriority): string {
  const colors: Record<TicketPriority, string> = {
    urgent: "red",
    high: "orange",
    medium: "yellow",
    low: "gray"
  };

  return colors[priority];
}

/**
 * Validation function for Ticket entity
 */
export function validateTicket(data: Partial<Ticket>): string[] {
  const errors: string[] = [];

  if (!data.customerId || data.customerId.trim().length === 0) {
    errors.push("Customer ID is required");
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push("Ticket subject is required");
  }

  if (data.subject && data.subject.length > 200) {
    errors.push("Ticket subject must be less than 200 characters");
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Ticket description is required");
  }

  if (data.description && data.description.length > 5000) {
    errors.push("Ticket description must be less than 5000 characters");
  }

  const validCategories: TicketCategory[] = [
    "order_issue", "product_inquiry", "payment_issue", "delivery_issue",
    "refund_request", "complaint", "feedback", "other"
  ];
  if (data.category && !validCategories.includes(data.category)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
  }

  const validPriorities: TicketPriority[] = ["low", "medium", "high", "urgent"];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push(`Invalid priority. Must be one of: ${validPriorities.join(", ")}`);
  }

  const validStatuses: TicketStatus[] = ["open", "in_progress", "waiting_customer", "resolved", "closed", "cancelled"];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const validSources: TicketSource[] = ["zalo", "facebook", "telegram", "phone", "email", "website", "internal"];
  if (data.source && !validSources.includes(data.source)) {
    errors.push(`Invalid source. Must be one of: ${validSources.join(", ")}`);
  }

  return errors;
}

/**
 * Validation function for Ticket Comment
 */
export function validateTicketComment(data: Partial<TicketComment>): string[] {
  const errors: string[] = [];

  if (!data.userId || data.userId.trim().length === 0) {
    errors.push("User ID is required for comment");
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push("Comment content is required");
  }

  if (data.content && data.content.length > 2000) {
    errors.push("Comment content must be less than 2000 characters");
  }

  return errors;
}
