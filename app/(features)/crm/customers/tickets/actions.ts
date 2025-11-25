"use server";

import { revalidatePath } from "next/cache";
import {
  createTicketUseCase,
  getTicketsUseCase,
  getTicketByIdUseCase,
  updateTicketUseCase,
  assignTicketUseCase,
  resolveTicketUseCase,
  addTicketCommentUseCase,
} from "@/app/api/customer-care/tickets/depends";
import type { TicketStatus, TicketPriority, TicketCategory, TicketSource } from "@/core/domain/customers/ticket";

/**
 * Get all tickets with optional filters
 */
export async function getTicketsAction(
  status?: TicketStatus,
  assignedTo?: string,
  priority?: TicketPriority,
  customerId?: string
) {
  try {
    const useCase = await getTicketsUseCase();
    const result = await useCase.execute({
      status,
      assignedTo,
      priority,
      customerId,
    });

    // Serialize dates for JSON transport
    return JSON.parse(JSON.stringify(result.tickets));
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
}

/**
 * Get ticket by ID
 */
export async function getTicketByIdAction(ticketId: string) {
  try {
    const useCase = await getTicketByIdUseCase();
    const result = await useCase.execute({ ticketId });

    // Serialize dates for JSON transport
    return JSON.parse(JSON.stringify(result.ticket));
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return null;
  }
}

/**
 * Create a new ticket
 */
export async function createTicketAction(formData: FormData) {
  try {
    const useCase = await createTicketUseCase();

    await useCase.execute({
      customerId: formData.get("customerId")?.toString() || "",
      customerName: formData.get("customerName")?.toString(),
      subject: formData.get("subject")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      priority: (formData.get("priority")?.toString() as TicketPriority) || "medium",
      category: (formData.get("category")?.toString() as TicketCategory) || "other",
      source: (formData.get("source")?.toString() as TicketSource) || "internal",
      orderId: formData.get("orderId") ? Number(formData.get("orderId")) : undefined,
      assignedTo: formData.get("assignedTo")?.toString(),
      assignedToName: formData.get("assignedToName")?.toString(),
      tags: formData.get("tags")?.toString().split(",").filter(Boolean) || [],
    });

    revalidatePath("/customer-care/tickets");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatusAction(ticketId: string, status: TicketStatus) {
  try {
    const useCase = await updateTicketUseCase();

    await useCase.execute({
      ticketId,
      updates: { status },
    });

    revalidatePath("/customer-care/tickets");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating ticket status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update ticket priority
 */
export async function updateTicketPriorityAction(ticketId: string, priority: TicketPriority) {
  try {
    const useCase = await updateTicketUseCase();

    await useCase.execute({
      ticketId,
      updates: { priority },
    });

    revalidatePath("/customer-care/tickets");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating ticket priority:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Assign ticket to staff
 */
export async function assignTicketAction(ticketId: string, assignedTo: string, assignedToName: string) {
  try {
    const useCase = await assignTicketUseCase();

    await useCase.execute({ ticketId, assignedTo, assignedToName });

    revalidatePath("/customer-care/tickets");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning ticket:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Resolve ticket
 */
export async function resolveTicketAction(ticketId: string, resolution: string, resolvedBy: string) {
  try {
    const useCase = await resolveTicketUseCase();

    await useCase.execute({ ticketId, resolution, resolvedBy });

    revalidatePath("/customer-care/tickets");
    return { success: true };
  } catch (error: any) {
    console.error("Error resolving ticket:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Add comment to ticket
 */
export async function addCommentAction(formData: FormData) {
  try {
    const useCase = await addTicketCommentUseCase();

    await useCase.execute({
      ticketId: formData.get("ticketId")?.toString() || "",
      userId: formData.get("userId")?.toString() || "",
      userName: formData.get("userName")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      isInternal: formData.get("isInternal") === "true",
    });

    revalidatePath("/customer-care/tickets");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return { success: false, error: error.message };
  }
}
