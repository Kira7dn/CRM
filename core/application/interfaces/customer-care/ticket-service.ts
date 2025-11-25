import type { Ticket, TicketComment, TicketStatus, TicketPriority, TicketCategory } from "@/core/domain/customers/ticket";

/**
 * Ticket payload for create/update operations
 * Extends Partial<Ticket> to follow domain-driven design
 */
export interface TicketPayload extends Partial<Ticket> { }

/**
 * Ticket filter options
 */
export interface TicketFilterOptions {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  customerId?: string;
  orderId?: number;
  source?: string;
  tags?: string[];
  isOverdue?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Ticket service interface
 * Defines operations for ticket management
 */
export interface TicketService {
  /**
   * Create a new support ticket
   */
  create(payload: TicketPayload): Promise<Ticket>;

  /**
   * Get ticket by ID
   */
  getById(ticketId: string): Promise<Ticket | null>;

  /**
   * Get ticket by ticket number
   */
  getByTicketNumber(ticketNumber: string): Promise<Ticket | null>;

  /**
   * Get all tickets with filters
   */
  getAll(filters?: TicketFilterOptions): Promise<Ticket[]>;

  /**
   * Update ticket
   */
  update(ticketId: string, payload: TicketPayload): Promise<Ticket | null>;

  /**
   * Assign ticket to staff
   */
  assign(ticketId: string, userId: string, userName: string): Promise<Ticket | null>;

  /**
   * Update ticket status
   */
  updateStatus(ticketId: string, status: TicketStatus): Promise<Ticket | null>;

  /**
   * Resolve ticket
   */
  resolve(ticketId: string, resolution: string, resolvedBy: string): Promise<Ticket | null>;

  /**
   * Close ticket
   */
  close(ticketId: string): Promise<Ticket | null>;

  /**
   * Add comment to ticket
   */
  addComment(ticketId: string, comment: Omit<TicketComment, "id" | "createdAt">): Promise<Ticket | null>;

  /**
   * Delete ticket (soft delete)
   */
  delete(ticketId: string): Promise<boolean>;

  /**
   * Get ticket count by status
   */
  getCountByStatus(): Promise<Record<TicketStatus, number>>;

  /**
   * Get overdue tickets
   */
  getOverdueTickets(): Promise<Ticket[]>;

  /**
   * Get next sequence number for ticket number generation
   */
  getNextSequenceNumber(date: Date): Promise<number>;
}
