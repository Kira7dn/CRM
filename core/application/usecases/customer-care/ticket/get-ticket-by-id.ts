import type { Ticket } from "@/core/domain/customers/ticket";
import type { TicketService } from "@/core/application/interfaces/customer-care/ticket-service";

/**
 * Request interface for getting a ticket by ID
 */
export interface GetTicketByIdRequest {
  ticketId: string;
}

/**
 * Response interface for getting a ticket by ID
 */
export interface GetTicketByIdResponse {
  ticket: Ticket | null;
}

/**
 * Use case for retrieving a single ticket by ID
 */
export class GetTicketByIdUseCase {
  constructor(private ticketService: TicketService) { }

  async execute(request: GetTicketByIdRequest): Promise<GetTicketByIdResponse> {
    if (!request.ticketId || request.ticketId.trim().length === 0) {
      throw new Error("Ticket ID is required");
    }

    const ticket = await this.ticketService.getById(request.ticketId);

    return { ticket };
  }
}
