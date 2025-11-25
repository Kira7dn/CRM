import type { Ticket, TicketComment } from "@/core/domain/customers/ticket";
import { validateTicketComment } from "@/core/domain/customers/ticket";
import type { TicketService } from "@/core/application/interfaces/customer-care/ticket-service";

/**
 * Request interface for adding a comment to a ticket
 */
export interface AddTicketCommentRequest {
  ticketId: string;
  userId: string;
  userName: string;
  content: string;
  isInternal?: boolean;
}

/**
 * Response interface for adding a comment
 */
export interface AddTicketCommentResponse {
  ticket: Ticket | null;
}

/**
 * Use case for adding a comment to a ticket
 */
export class AddTicketCommentUseCase {
  constructor(private ticketService: TicketService) { }

  async execute(request: AddTicketCommentRequest): Promise<AddTicketCommentResponse> {
    if (!request.ticketId || request.ticketId.trim().length === 0) {
      throw new Error("Ticket ID is required");
    }

    // Create comment object
    const comment: Omit<TicketComment, "id" | "createdAt"> = {
      userId: request.userId,
      userName: request.userName,
      content: request.content,
      isInternal: request.isInternal || false
    };

    // Validate comment
    const errors = validateTicketComment(comment as TicketComment);
    if (errors.length > 0) {
      throw new Error(`Comment validation failed: ${errors.join(", ")}`);
    }

    const ticket = await this.ticketService.addComment(request.ticketId, comment);

    if (!ticket) {
      throw new Error(`Ticket with ID ${request.ticketId} not found`);
    }

    return { ticket };
  }
}
