import type { Order } from "@/core/domain/order";
import type { OrderService, GetOrdersParams, OrderPayload } from "@/core/application/interfaces/order-service";
import clientPromise from "@/infrastructure/db/mongo";

/**
 * MongoDB document - matches domain Order structure
 */
type OrderDocument = Omit<Order, 'id'> & { _id: number };

/**
 * Converts MongoDB OrderDocument to domain Order
 */
function toOrder(doc: OrderDocument): Order {
  const { _id, ...orderData } = doc;
  return {
    ...orderData,
    id: _id, // Map _id to id
  };
}

/**
 * MongoDB counter document interface
 */
interface CounterDocument {
  _id: string;
  seq: number;
}

const getNextOrderId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // First, try to get the current counter
  let counter = await db.collection<CounterDocument>("counters").findOne({ _id: "orders" });

  if (!counter) {
    // If no counter exists, find the highest existing order ID
    const highestOrder = await db.collection<OrderDocument>("orders").find().sort({ _id: -1 }).limit(1).toArray();
    const nextId = highestOrder.length > 0 ? highestOrder[0]._id + 1 : 1;

    // Create counter with the next ID
    await db.collection<CounterDocument>("counters").insertOne({ _id: "orders", seq: nextId });
    return nextId;
  }

  // If counter exists, check if it's behind the highest existing ID
  const highestOrder = await db.collection<OrderDocument>("orders").find().sort({ _id: -1 }).limit(1).toArray();
  const highestId = highestOrder.length > 0 ? highestOrder[0]._id : 0;

  if (counter.seq <= highestId) {
    // Counter is behind, update it to highestId + 1
    const nextId = highestId + 1;
    await db.collection<CounterDocument>("counters").updateOne(
      { _id: "orders" },
      { $set: { seq: nextId } }
    );
    return nextId;
  }

  // Counter is ahead, increment normally
  const updated = await db.collection<CounterDocument>("counters").findOneAndUpdate(
    { _id: "orders" },
    { $inc: { seq: 1 } },
    { returnDocument: "after" }
  );
  return updated!.seq;
};

export const orderRepository: OrderService & {
  getNextId(): Promise<number>;
} = {
  async getAll(params: GetOrdersParams = {}): Promise<Order[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const query: Record<string, unknown> = {};
    if (params.status) query.status = params.status;
    if (params.zaloUserId) query.zaloUserId = params.zaloUserId;
    const docs = await db.collection<OrderDocument>("orders").find(query).sort({ _id: -1 }).toArray();
    return docs.map(toOrder);
  },

  async getById(id: number): Promise<Order | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection<OrderDocument>("orders").findOne({ _id: id });
    return doc ? toOrder(doc) : null;
  },

  async create(payload: OrderPayload): Promise<Order> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    if (!payload.delivery) {
      throw new Error("Delivery info is required");
    }
    const id = payload.id ?? (await getNextOrderId());
    const now = new Date();
    const doc: OrderDocument = {
      _id: id,
      zaloUserId: payload.zaloUserId || "",
      checkoutSdkOrderId: payload.checkoutSdkOrderId,
      status: payload.status ?? "pending",
      paymentStatus: payload.paymentStatus ?? "pending",
      createdAt: now,
      updatedAt: payload.updatedAt ?? now,
      items: payload.items || [],
      delivery: payload.delivery || {
        name: "",
        phone: "",
        address: "",
      },
      total: payload.total ?? 0,
      note: payload.note,
    };
    await db.collection<OrderDocument>("orders").insertOne(doc);
    return toOrder(doc);
  },

  async update(payload: OrderPayload): Promise<Order | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // For updates, id must be provided
    if (!payload.id) {
      throw new Error("Order ID is required for updates");
    }

    const updateObj: Partial<OrderDocument> = {};
    if (payload.zaloUserId !== undefined) updateObj.zaloUserId = payload.zaloUserId;
    if (payload.checkoutSdkOrderId !== undefined) updateObj.checkoutSdkOrderId = payload.checkoutSdkOrderId;
    if (payload.status !== undefined) updateObj.status = payload.status;
    if (payload.paymentStatus !== undefined) updateObj.paymentStatus = payload.paymentStatus;
    // Always update the timestamp
    updateObj.updatedAt = new Date();
    if (payload.items !== undefined) updateObj.items = payload.items;
    if (payload.delivery !== undefined) updateObj.delivery = payload.delivery;
    if (payload.total !== undefined) updateObj.total = payload.total;
    if (payload.note !== undefined) updateObj.note = payload.note;

    const result = await db.collection<OrderDocument>("orders").findOneAndUpdate(
      { _id: payload.id },
      { $set: updateObj },
      { returnDocument: "after" }
    );

    return result ? toOrder(result) : null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection<OrderDocument>("orders").deleteOne({ _id: id });
    return result.deletedCount > 0;
  },

  getNextId: getNextOrderId,
};
