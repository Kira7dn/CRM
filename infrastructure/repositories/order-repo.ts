import type { Order } from "@/core/domain/order";
import type { OrderService, GetOrdersParams, CreateOrderPayload, UpdateOrderPayload } from "@/core/application/interfaces/order-service";
import clientPromise from "@/infrastructure/db/mongo";

/**
 * MongoDB document interface for Order collection
 * Note: MongoDB schema differs slightly from domain Order type
 */
interface OrderDocument {
  _id: number;
  zaloUserId: string;
  checkoutSdkOrderId?: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  receivedAt?: Date;
  items: Array<{
    product: Record<string, unknown>; // Full product object stored in MongoDB
    quantity: number;
  }>;
  delivery: {
    name: string;
    phone: string;
    address: string;
    location?: { lat: number; lon: number };
  };
  total: number;
  note?: string;
}

/**
 * Helper function to convert MongoDB OrderDocument to domain Order
 */
function toOrder(doc: OrderDocument): Order {
  return {
    id: doc._id,
    zaloUserId: doc.zaloUserId,
    checkoutSdkOrderId: doc.checkoutSdkOrderId,
    status: doc.status as Order['status'],
    paymentStatus: doc.paymentStatus as Order['paymentStatus'],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    items: doc.items.map(item => ({
      product: item.product || {}, // Use the full product object from MongoDB
      quantity: item.quantity,
    })),
    delivery: {
      alias: '',
      address: doc.delivery.address,
      name: doc.delivery.name,
      phone: doc.delivery.phone,
      stationId: 0,
      image: '',
      location: { lat: doc.delivery.location?.lat || 0, lng: doc.delivery.location?.lon || 0 },
    },
    total: doc.total,
    note: doc.note || '',
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

  async create(payload: CreateOrderPayload): Promise<Order> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    if (!payload.items || payload.items.length === 0) {
      throw new Error("Order must have valid items");
    }
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
      items: payload.items.map(item => ({
        product: item.product || {}, // Store full product object
        quantity: item.quantity,
      })),
      delivery: {
        name: payload.delivery.name,
        phone: payload.delivery.phone,
        address: payload.delivery.address,
        location: payload.delivery.location ? {
          lat: payload.delivery.location.lat,
          lon: payload.delivery.location.lng,
        } : undefined,
      },
      total: payload.total ?? 0,
      note: payload.note ?? "",
    };
    await db.collection<OrderDocument>("orders").insertOne(doc);
    return toOrder(doc);
  },

  async update(id: number, payload: UpdateOrderPayload): Promise<Order | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const updateObj: Partial<OrderDocument> = {};
    if (payload.zaloUserId !== undefined) updateObj.zaloUserId = payload.zaloUserId;
    if (payload.checkoutSdkOrderId !== undefined) updateObj.checkoutSdkOrderId = payload.checkoutSdkOrderId;
    if (payload.status !== undefined) updateObj.status = payload.status;
    if (payload.paymentStatus !== undefined) updateObj.paymentStatus = payload.paymentStatus;
    if (payload.updatedAt !== undefined) updateObj.updatedAt = payload.updatedAt;
    if (payload.items !== undefined) {
      updateObj.items = payload.items.map(item => ({
        product: item.product || {}, // Store full product object
        quantity: item.quantity,
      }));
    }
    if (payload.delivery !== undefined) {
      updateObj.delivery = {
        name: payload.delivery.name,
        phone: payload.delivery.phone,
        address: payload.delivery.address,
        location: payload.delivery.location ? {
          lat: payload.delivery.location.lat,
          lon: payload.delivery.location.lng,
        } : undefined,
      };
    }
    if (payload.total !== undefined) updateObj.total = payload.total;
    if (payload.note !== undefined) updateObj.note = payload.note;

    const result = await db.collection<OrderDocument>("orders").findOneAndUpdate(
      { _id: id },
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
