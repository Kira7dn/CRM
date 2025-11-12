import type { Order } from "@/core/domain/order";
import type { OrderService, GetOrdersParams, CreateOrderPayload, UpdateOrderPayload } from "@/core/application/interfaces/order-service";
import clientPromise from "@/infrastructure/db/mongo";

const getNextOrderId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const updated = await db.collection("counters").findOneAndUpdate(
    { _id: "orders" as any },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
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
    const docs = await db.collection("orders").find(query).sort({ _id: -1 }).toArray();
    return docs.map((d: any) => ({
      id: d._id,
      zaloUserId: d.zaloUserId,
      checkoutSdkOrderId: d.checkoutSdkOrderId,
      status: d.status,
      paymentStatus: d.paymentStatus,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      items: d.items,
      delivery: d.delivery,
      total: d.total,
      note: d.note,
    }));
  },

  async getById(id: number): Promise<Order | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("orders").findOne({ _id: id as any });
    return doc ? {
      id: (doc._id as any) as number,
      zaloUserId: doc.zaloUserId,
      checkoutSdkOrderId: doc.checkoutSdkOrderId,
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      items: doc.items,
      delivery: doc.delivery,
      total: doc.total,
      note: doc.note,
    } : null;
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
    await db.collection("orders").insertOne({
      _id: id as any,
      zaloUserId: payload.zaloUserId,
      checkoutSdkOrderId: payload.checkoutSdkOrderId,
      status: payload.status ?? "pending",
      paymentStatus: payload.paymentStatus ?? "pending",
      createdAt: now,
      updatedAt: payload.updatedAt ?? now,
      items: payload.items,
      delivery: payload.delivery,
      total: payload.total ?? 0,
      note: payload.note ?? "",
    } as any);
    return {
      id,
      zaloUserId: payload.zaloUserId || "",
      checkoutSdkOrderId: payload.checkoutSdkOrderId,
      status: payload.status ?? "pending",
      paymentStatus: payload.paymentStatus ?? "pending",
      createdAt: now,
      updatedAt: payload.updatedAt ?? now,
      items: payload.items,
      delivery: payload.delivery,
      total: payload.total ?? 0,
      note: payload.note ?? "",
    };
  },

  async update(id: number, payload: UpdateOrderPayload): Promise<Order | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const updateObj: any = {};
    if (payload.zaloUserId !== undefined) updateObj.zaloUserId = payload.zaloUserId;
    if (payload.checkoutSdkOrderId !== undefined) updateObj.checkoutSdkOrderId = payload.checkoutSdkOrderId;
    if (payload.status !== undefined) updateObj.status = payload.status;
    if (payload.paymentStatus !== undefined) updateObj.paymentStatus = payload.paymentStatus;
    if (payload.updatedAt !== undefined) updateObj.updatedAt = payload.updatedAt;
    if (payload.items !== undefined) updateObj.items = payload.items;
    if (payload.delivery !== undefined) updateObj.delivery = payload.delivery;
    if (payload.total !== undefined) updateObj.total = payload.total;
    if (payload.note !== undefined) updateObj.note = payload.note;
    const result = await db.collection("orders").updateOne({ _id: id as any }, { $set: updateObj });
    if (result.modifiedCount > 0) {
      const updated = await db.collection("orders").findOne({ _id: id as any });
      return updated ? {
        id: (updated._id as any) as number,
        zaloUserId: updated.zaloUserId,
        checkoutSdkOrderId: updated.checkoutSdkOrderId,
        status: updated.status,
        paymentStatus: updated.paymentStatus,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        items: updated.items,
        delivery: updated.delivery,
        total: updated.total,
        note: updated.note,
      } : null;
    }
    return null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection("orders").deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  },

  getNextId: getNextOrderId,
};
