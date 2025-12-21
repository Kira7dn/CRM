import type { MongoClient } from 'mongodb';
import clientPromise from './mongo';

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export abstract class BaseRepository<T extends { id: ID }, ID> {
  protected abstract collectionName: string;

  constructor(protected client?: MongoClient) { }

  /** Get MongoDB client */
  protected async getClient(): Promise<MongoClient> {
    if (this.client) {
      return this.client;
    }
    return await clientPromise;
  }

  /** Get collection for this repository */
  protected async getCollection() {
    const client = await this.getClient();
    return client.db(process.env.MONGODB_DB).collection(this.collectionName);
  }

  /** Helper to build paginated query */
  protected buildPaginationQuery(options: PaginationOptions = {}) {
    const page = options.page || 1
    const limit = options.limit || 50
    const skip = (page - 1) * limit

    return { page, limit, skip }
  }

  /** Convert _id from DB to domain id - default implementation */
  protected convertId(value: any): ID {
    // Convert ObjectId to string for client-side serialization
    return value?.toString() || value as ID;
  }

  /** Convert Mongo document → Domain entity */
  protected toDomain(doc: any): T {
    const { _id, ...data } = doc;
    return { ...data, id: this.convertId(_id) };
  }

  /** Convert Domain entity → Mongo document */
  protected toDocument(entity: Partial<T>): any {
    const { id, ...data } = entity;
    if (id !== undefined) {
      return { ...data, _id: id };
    }
    return data;
  }
}
