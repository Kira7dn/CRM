import type { Ticket } from "@/core/domain/customers/ticket";
import type { TicketService } from "@/core/application/interfaces/customer-care/ticket-service";

/**
 * Request interface for resolving a ticket
 */
export interface ResolveTicketRequest {
  ticketId: string;
  resolution: string;
  resolvedBy: string;
}

/**
 * Response interface for resolving a ticket
 */
export interface ResolveTicketResponse {
  ticket: Ticket | null;
}

/**
 * Use case for resolving a ticket
 */
export class ResolveTicketUseCase {
  constructor(private ticketService: TicketService) { }

  async execute(request: ResolveTicketRequest): Promise<ResolveTicketResponse> {
    if (!request.ticketId || request.ticketId.trim().length === 0) {
      throw new Error("Ticket ID is required");
    }

    if (!request.resolution || request.resolution.trim().length === 0) {
      throw new Error("Resolution is required");
    }

    if (!request.resolvedBy || request.resolvedBy.trim().length === 0) {
      throw new Error("Resolver user ID is required");
    }

    const ticket = await this.ticketService.resolve(
      request.ticketId,
      request.resolution,
      request.resolvedBy
    );

    if (!ticket) {
      throw new Error(`Ticket with ID ${request.ticketId} not found`);
    }

    return { ticket };
  }
}
