import type { Ticket } from "@/core/domain/customers/ticket";
import { validateTicket } from "@/core/domain/customers/ticket";
import type { TicketService, TicketPayload } from "@/core/application/interfaces/customer-care/ticket-service";

/**
 * Request interface for updating a ticket
 */
export interface UpdateTicketRequest {
  ticketId: string;
  updates: TicketPayload;
}

/**
 * Response interface for updating a ticket
 */
export interface UpdateTicketResponse {
  ticket: Ticket | null;
}

/**
 * Use case for updating a ticket
 */
export class UpdateTicketUseCase {
  constructor(private ticketService: TicketService) { }

  async execute(request: UpdateTicketRequest): Promise<UpdateTicketResponse> {
    if (!request.ticketId || request.ticketId.trim().length === 0) {
      throw new Error("Ticket ID is required");
    }

    // Validate updates
    const errors = validateTicket(request.updates);
    if (errors.length > 0) {
      throw new Error(`Ticket validation failed: ${errors.join(", ")}`);
    }

    // Update timestamp
    const payload: TicketPayload = {
      ...request.updates,
      updatedAt: new Date()
    };

    const ticket = await this.ticketService.update(request.ticketId, payload);

    if (!ticket) {
      throw new Error(`Ticket with ID ${request.ticketId} not found`);
    }

    return { ticket };
  }
}
