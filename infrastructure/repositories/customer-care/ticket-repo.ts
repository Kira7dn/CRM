import { ObjectId } from "mongodb";
import type { Ticket, TicketComment, TicketStatus } from "@/core/domain/customers/ticket";
import { calculateResponseTime, calculateResolutionTime, isTicketOverdue } from "@/core/domain/customers/ticket";
import type { TicketService, TicketPayload, TicketFilterOptions } from "@/core/application/interfaces/customer-care/ticket-service";
import { BaseRepository } from "@/infrastructure/db/base-repository";

/**
 * Ticket Repository implementation
 * Extends BaseRepository with string ID type (MongoDB ObjectId)
 */
export class TicketRepository extends BaseRepository<Ticket, string> implements TicketService {
  protected collectionName = "tickets";

  /**
   * Convert MongoDB ObjectId to string
   */
  protected convertId(value: ObjectId | string): string {
    if (typeof value === "string") return value;
    return value.toString();
  }

  /**
   * Convert Mongo document to Ticket domain entity
   */
  protected toDomain(doc: any): Ticket {
    const { _id, ...data } = doc;

    return {
      ...data,
      id: this.convertId(_id),
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
      resolvedAt: data.resolvedAt ? (data.resolvedAt instanceof Date ? data.resolvedAt : new Date(data.resolvedAt)) : undefined,
      closedAt: data.closedAt ? (data.closedAt instanceof Date ? data.closedAt : new Date(data.closedAt)) : undefined,
      comments: (data.comments || []).map((c: any) => ({
        ...c,
        createdAt: c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt)
      }))
    };
  }

  /**
   * Create a new ticket
   */
  async create(payload: TicketPayload): Promise<Ticket> {
    const collection = await this.getCollection();

    const doc = this.toDocument(payload);
    const result = await collection.insertOne(doc);

    return this.toDomain({ _id: result.insertedId, ...doc });
  }

  /**
   * Get ticket by ID
   */
  async getById(ticketId: string): Promise<Ticket | null> {
    const collection = await this.getCollection();

    const doc = await collection.findOne({ _id: new ObjectId(ticketId) });
    if (!doc) return null;

    return this.toDomain(doc);
  }

  /**
   * Get ticket by ticket number
   */
  async getByTicketNumber(ticketNumber: string): Promise<Ticket | null> {
    const collection = await this.getCollection();

    const doc = await collection.findOne({ ticketNumber });
    if (!doc) return null;

    return this.toDomain(doc);
  }

  /**
   * Get all tickets with filters
   */
  async getAll(filters: TicketFilterOptions = {}): Promise<Ticket[]> {
    const collection = await this.getCollection();

    // Build query
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    if (filters.customerId) {
      query.customerId = filters.customerId;
    }

    if (filters.orderId) {
      query.orderId = filters.orderId;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.createdAfter) {
      query.createdAt = { ...query.createdAt, $gte: filters.createdAfter };
    }

    if (filters.createdBefore) {
      query.createdAt = { ...query.createdAt, $lte: filters.createdBefore };
    }

    // Execute query
    let cursor = collection.find(query).sort({ createdAt: -1 });

    if (filters.offset) {
      cursor = cursor.skip(filters.offset);
    }

    if (filters.limit) {
      cursor = cursor.limit(filters.limit);
    }

    const docs = await cursor.toArray();
    let tickets = docs.map(doc => this.toDomain(doc));

    // Apply isOverdue filter if specified
    if (filters.isOverdue !== undefined) {
      tickets = tickets.filter(ticket => isTicketOverdue(ticket) === filters.isOverdue);
    }

    return tickets;
  }

  /**
   * Update ticket
   */
  async update(ticketId: string, payload: TicketPayload): Promise<Ticket | null> {
    const collection = await this.getCollection();

    const updateDoc = this.toDocument(payload);
    delete updateDoc._id; // Don't update _id

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      { $set: { ...updateDoc, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return this.toDomain(result);
  }

  /**
   * Assign ticket to staff
   */
  async assign(ticketId: string, userId: string, userName: string): Promise<Ticket | null> {
    const collection = await this.getCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      {
        $set: {
          assignedTo: userId,
          assignedToName: userName,
          status: "in_progress",
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return this.toDomain(result);
  }

  /**
   * Update ticket status
   */
  async updateStatus(ticketId: string, status: TicketStatus): Promise<Ticket | null> {
    const collection = await this.getCollection();

    const updateFields: any = {
      status,
      updatedAt: new Date()
    };

    // Set closedAt if status is closed
    if (status === "closed" || status === "cancelled") {
      updateFields.closedAt = new Date();
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return this.toDomain(result);
  }

  /**
   * Resolve ticket
   */
  async resolve(ticketId: string, resolution: string, resolvedBy: string): Promise<Ticket | null> {
    const collection = await this.getCollection();

    const ticket = await this.getById(ticketId);
    if (!ticket) return null;

    const resolvedAt = new Date();
    const resolutionTime = calculateResolutionTime(ticket.createdAt, resolvedAt);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      {
        $set: {
          status: "resolved",
          resolution,
          resolvedAt,
          resolvedBy,
          resolutionTime,
          updatedAt: resolvedAt
        }
      },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return this.toDomain(result);
  }

  /**
   * Close ticket
   */
  async close(ticketId: string): Promise<Ticket | null> {
    return this.updateStatus(ticketId, "closed");
  }

  /**
   * Add comment to ticket
   */
  async addComment(ticketId: string, comment: Omit<TicketComment, "id" | "createdAt">): Promise<Ticket | null> {
    const collection = await this.getCollection();

    const ticket = await this.getById(ticketId);
    if (!ticket) return null;

    const newComment: TicketComment = {
      id: new ObjectId().toString(),
      ...comment,
      createdAt: new Date()
    };

    // Calculate response time if this is the first comment
    const updateFields: any = {
      comments: [...ticket.comments, newComment],
      updatedAt: new Date()
    };

    if (ticket.comments.length === 0 && !newComment.isInternal) {
      const responseTime = calculateResponseTime(ticket.createdAt, newComment.createdAt);
      updateFields.responseTime = responseTime;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return this.toDomain(result);
  }

  /**
   * Delete ticket (soft delete by setting status to cancelled)
   */
  async delete(ticketId: string): Promise<boolean> {
    const result = await this.updateStatus(ticketId, "cancelled");
    return result !== null;
  }

  /**
   * Get ticket count by status
   */
  async getCountByStatus(): Promise<Record<TicketStatus, number>> {
    const collection = await this.getCollection();

    const results = await collection.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const counts: Record<string, number> = {};
    results.forEach(r => {
      counts[r._id] = r.count;
    });

    const statuses: TicketStatus[] = ["open", "in_progress", "waiting_customer", "resolved", "closed", "cancelled"];
    const result: any = {};
    statuses.forEach(status => {
      result[status] = counts[status] || 0;
    });

    return result;
  }

  /**
   * Get overdue tickets
   */
  async getOverdueTickets(): Promise<Ticket[]> {
    const tickets = await this.getAll({
      status: "open" as TicketStatus
    });

    return tickets.filter(ticket => isTicketOverdue(ticket));
  }

  /**
   * Get next sequence number for ticket number generation
   */
  async getNextSequenceNumber(date: Date): Promise<number> {
    const collection = await this.getCollection();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await collection.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return count + 1;
  }
}
