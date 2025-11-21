import { BaseRepository } from "@/infrastructure/db/base-repository";
import { User } from "@/core/domain/managements/user";
import type { UserService, UpsertUserPayload } from "@/core/application/interfaces/user-service";

export class UserRepository extends BaseRepository<User, string> implements UserService {
  protected collectionName = "users";

  async upsert(payload: UpsertUserPayload): Promise<User> {
    const collection = await this.getCollection();
    const now = new Date();

    const update: any = {
      name: payload.name ?? "",
      avatar: payload.avatar ?? "",
      phone: payload.phone ?? "",
      email: payload.email ?? "",
      address: payload.address ?? "",
      updatedAt: now,
    };

    const doc = await collection.findOneAndUpdate(
      { _id: payload.id } as any,
      { $set: update, $setOnInsert: { createdAt: now } },
      { upsert: true, returnDocument: "after" }
    );

    if (!doc || !doc.value) throw new Error("Failed to upsert user");
    return this.toDomain(doc.value);
  }

  async getById(id: string): Promise<User | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: id } as any);
    return doc ? this.toDomain(doc) : null;
  }

  protected toDomain(doc: any): User {
    const { _id, ...userData } = doc;
    return new User(
      _id,
      userData.name,
      userData.avatar,
      userData.phone,
      userData.email,
      userData.address,
      userData.createdAt,
      userData.updatedAt
    );
  }
}
