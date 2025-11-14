import { BaseRepository } from "@/infrastructure/db/base-repository";
import { Order } from "@/core/domain/order";
import type { OrderService, GetOrdersParams, OrderPayload } from "@/core/application/interfaces/order-service";
import { getNextId } from "@/infrastructure/db/auto-increment";

export class OrderRepository extends BaseRepository<Order, number> implements OrderService {
  protected collectionName = "orders";

  async getAll(params: GetOrdersParams = {}): Promise<Order[]> {
    const collection = await this.getCollection();
    const query: Record<string, unknown> = {};
    if (params.status) query.status = params.status;
    if (params.zaloUserId) query.zaloUserId = params.zaloUserId;
    const docs = await collection.find(query).sort({ _id: -1 }).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async getById(id: number): Promise<Order | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: id } as any);
    return doc ? this.toDomain(doc) : null;
  }

  async create(payload: OrderPayload): Promise<Order> {
    if (!payload.delivery) {
      throw new Error("Delivery info is required");
    }

    const client = await this.getClient();
    const id = payload.id ?? (await getNextId(client, this.collectionName));
    const now = new Date();

    const doc = this.toDocument({
      ...payload,
      id,
      zaloUserId: payload.zaloUserId || "",
      checkoutSdkOrderId: payload.checkoutSdkOrderId,
      status: payload.status ?? "pending",
      paymentStatus: payload.paymentStatus ?? "pending",
      createdAt: now,
      updatedAt: payload.updatedAt ?? now,
      items: payload.items || [],
      delivery: payload.delivery,
      total: payload.total ?? 0,
      note: payload.note
    });

    const collection = await this.getCollection();
    await collection.insertOne(doc);
    return this.toDomain(doc);
  }

  async update(payload: OrderPayload): Promise<Order | null> {
    if (!payload.id) throw new Error("Order ID is required for update");

    const now = new Date();
    const { id, ...updateFields } = payload;

    const updateObj: any = {
      ...updateFields,
      updatedAt: now
    };

    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: id } as any,
      { $set: updateObj },
      { returnDocument: "after" }
    );

    return result && result.value ? this.toDomain(result.value) : null;
  }

  async delete(id: number): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id } as any);
    return result.deletedCount > 0;
  }

  protected toDomain(doc: any): Order {
    const { _id, ...orderData } = doc;
    return new Order(
      _id,
      orderData.zaloUserId,
      orderData.checkoutSdkOrderId,
      orderData.status,
      orderData.paymentStatus,
      orderData.createdAt,
      orderData.updatedAt,
      orderData.items,
      orderData.delivery,
      orderData.total,
      orderData.note
    );
  }
}
