import { BaseRepository } from "@/infrastructure/db/base-repository";
import { Order } from "@/core/domain/managements/order";
import type { OrderService, GetOrdersParams, OrderPayload } from "@/core/application/interfaces/order-service";
import { getNextId } from "@/infrastructure/db/auto-increment";

export class OrderRepository extends BaseRepository<Order, number> implements OrderService {
  protected collectionName = "orders";

  async getAll(params: GetOrdersParams = {}): Promise<Order[]> {
    const collection = await this.getCollection();
    const query: Record<string, unknown> = {};
    if (params.status) query.status = params.status;
    if (params.customerId) query.customerId = params.customerId;
    if (params.platformSource) query.platformSource = params.platformSource;
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

    const doc = this.toDocument({
      ...payload,
      id
    });

    const collection = await this.getCollection();
    await collection.insertOne(doc);
    return this.toDomain(doc);
  }

  async update(payload: OrderPayload): Promise<Order | null> {
    if (!payload.id) throw new Error("Order ID is required for update");

    const { id, ...updateFields } = payload;
    console.log(`[OrderRepository] Updating order ${id} with:`, updateFields);

    const updateObj: any = {
      ...updateFields,
      updatedAt: new Date()
    };

    const collection = await this.getCollection();
    try {
      const result = await collection.findOneAndUpdate(
        { _id: id } as any,
        { $set: updateObj },
        {
          returnDocument: 'after',
          includeResultMetadata: true
        }
      );

      console.log('[OrderRepository] Update result:', {
        ok: result.ok,
        lastErrorObject: result.lastErrorObject,
        value: result.value
      });

      if (!result.value) {
        console.error(`[OrderRepository] Order with ID ${id} not found`);
        return null;
      }

      return this.toDomain(result.value);
    } catch (error) {
      console.error('[OrderRepository] Error updating order:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id } as any);
    return result.deletedCount > 0;
  }

  async getByPlatformOrderId(platformOrderId: string, platformSource: string): Promise<Order | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({
      platformOrderId,
      platformSource
    });
    return doc ? this.toDomain(doc) : null;
  }

}
