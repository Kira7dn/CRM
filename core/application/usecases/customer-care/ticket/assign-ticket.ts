import type { Ticket } from "@/core/domain/customers/ticket";
import type { TicketService } from "@/core/application/interfaces/customer-care/ticket-service";

/**
 * Request interface for assigning a ticket
 */
export interface AssignTicketRequest {
  ticketId: string;
  assignedTo: string;
  assignedToName: string;
}

/**
 * Response interface for assigning a ticket
 */
export interface AssignTicketResponse {
  ticket: Ticket | null;
}

/**
 * Use case for assigning a ticket to a staff member
 */
export class AssignTicketUseCase {
  constructor(private ticketService: TicketService) { }

  async execute(request: AssignTicketRequest): Promise<AssignTicketResponse> {
    if (!request.ticketId || request.ticketId.trim().length === 0) {
      throw new Error("Ticket ID is required");
    }

    if (!request.assignedTo || request.assignedTo.trim().length === 0) {
      throw new Error("Assigned user ID is required");
    }

    if (!request.assignedToName || request.assignedToName.trim().length === 0) {
      throw new Error("Assigned user name is required");
    }

    const ticket = await this.ticketService.assign(
      request.ticketId,
      request.assignedTo,
      request.assignedToName
    );

    if (!ticket) {
      throw new Error(`Ticket with ID ${request.ticketId} not found`);
    }

    return { ticket };
  }
}
