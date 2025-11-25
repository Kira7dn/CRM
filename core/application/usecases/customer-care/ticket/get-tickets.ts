import type { Ticket } from "@/core/domain/customers/ticket";
import type { TicketService, TicketFilterOptions } from "@/core/application/interfaces/customer-care/ticket-service";

/**
 * Request interface for getting tickets
 */
export interface GetTicketsRequest extends TicketFilterOptions { }

/**
 * Response interface for getting tickets
 */
export interface GetTicketsResponse {
  tickets: Ticket[];
  total: number;
}

/**
 * Use case for retrieving tickets with filters
 */
export class GetTicketsUseCase {
  constructor(private ticketService: TicketService) { }

  async execute(request: GetTicketsRequest = {}): Promise<GetTicketsResponse> {
    const tickets = await this.ticketService.getAll(request);

    return {
      tickets,
      total: tickets.length
    };
  }
}
