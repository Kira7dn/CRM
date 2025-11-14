import type { MongoClient } from 'mongodb';
import clientPromise from './mongo';

export abstract class BaseRepository<T extends { id: ID }, ID> {
  protected abstract collectionName: string;

  constructor(protected client?: MongoClient) {}

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

  /** Convert _id from DB to domain id - default implementation */
  protected convertId(value: any): ID {
    // Default: assume ID type matches the value type
    return value as ID;
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
