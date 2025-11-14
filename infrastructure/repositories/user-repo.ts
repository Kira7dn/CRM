import type { User } from "@/core/domain/user";
import type { UserService, UpsertUserPayload } from "@/core/application/interfaces/user-service";
import clientPromise from "@/infrastructure/db/mongo";

/**
 * MongoDB document - uses User type with _id mapping
 */
type UserDocument = Omit<User, 'id'> & { _id: string };

/**
 * Converts MongoDB document to domain User entity
 */
function toUser(doc: UserDocument): User {
  const { _id, ...userData } = doc;
  return {
    ...userData,
    id: _id, // External ID is stored in _id
  };
}

export const userRepository: UserService = {
  async upsert(payload: UpsertUserPayload): Promise<User> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const now = new Date();
    const update: Partial<UserDocument> = {
      name: payload.name ?? "",
      avatar: payload.avatar ?? "",
      phone: payload.phone ?? "",
      email: payload.email ?? "",
      address: payload.address ?? "",
      updatedAt: now,
    };
    const doc = await db.collection<UserDocument>("users").findOneAndUpdate(
      { _id: payload.id },
      { $set: update, $setOnInsert: { createdAt: now } },
      { upsert: true, returnDocument: "after" }
    );
    if (!doc) throw new Error("Failed to upsert user");
    return toUser(doc);
  },

  async getById(id: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection<UserDocument>("users").findOne({ _id: id });
    return doc ? toUser(doc) : null;
  },
};
