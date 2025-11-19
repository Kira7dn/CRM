/**
 * Interface: Interaction History Service
 */

import type {
  InteractionHistory,
  CustomerInteractionSummary,
} from "@/core/domain/customer-care/interaction-history";

export interface InteractionHistoryPayload extends Partial<InteractionHistory> {}

export interface InteractionHistoryFilters {
  customerId?: string;
  type?: string;
  channel?: string;
  direction?: "inbound" | "outbound";
  requiresFollowUp?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface InteractionHistoryService {
  create(payload: InteractionHistoryPayload): Promise<InteractionHistory>;
  getAll(filters: InteractionHistoryFilters): Promise<InteractionHistory[]>;
  getById(id: string): Promise<InteractionHistory | null>;
  getByCustomer(
    customerId: string,
    limit?: number
  ): Promise<InteractionHistory[]>;
  getSummary(customerId: string): Promise<CustomerInteractionSummary | null>;
  update(
    id: string,
    payload: Partial<InteractionHistoryPayload>
  ): Promise<InteractionHistory | null>;
  markFollowedUp(id: string): Promise<InteractionHistory | null>;
}
