import type { Ticket, TicketPriority, TicketCategory, TicketSource } from "@/core/domain/customers/ticket";
import { validateTicket, generateTicketNumber } from "@/core/domain/customers/ticket";
import type { TicketService, TicketPayload } from "@/core/application/interfaces/customer-care/ticket-service";

/**
 * Request interface for creating a ticket
 */
export interface CreateTicketRequest extends TicketPayload {
  customerId: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  source: TicketSource;
  orderId?: number;
  tags?: string[];
  assignedTo?: string;
}

/**
 * Response interface for creating a ticket
 */
export interface CreateTicketResponse {
  ticket: Ticket;
}

/**
 * Use case for creating a new support ticket
 */
export class CreateTicketUseCase {
  constructor(private ticketService: TicketService) { }

  async execute(request: CreateTicketRequest): Promise<CreateTicketResponse> {
    // Validate ticket data
    const errors = validateTicket(request);
    if (errors.length > 0) {
      throw new Error(`Ticket validation failed: ${errors.join(", ")}`);
    }

    // Generate ticket number
    const now = new Date();
    const sequenceNumber = await this.ticketService.getNextSequenceNumber(now);
    const ticketNumber = generateTicketNumber(now, sequenceNumber);

    // Create ticket payload
    const payload: TicketPayload = {
      ticketNumber,
      customerId: request.customerId,
      customerName: request.customerName,
      subject: request.subject,
      description: request.description,
      category: request.category,
      priority: request.priority,
      status: "open",
      source: request.source,
      orderId: request.orderId,
      tags: request.tags || [],
      assignedTo: request.assignedTo,
      assignedToName: request.assignedToName,
      comments: [],
      createdAt: now,
      updatedAt: now,
    };

    // Create ticket
    const ticket = await this.ticketService.create(payload);

    return { ticket };
  }
}
