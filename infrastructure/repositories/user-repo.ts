import type { User } from "@/core/domain/user";
import type { UserService, UpsertUserPayload } from "@/core/application/interfaces/user-service";
import clientPromise from "@/infrastructure/db/mongo";

export const userRepository: UserService = {
  async upsert(payload: UpsertUserPayload): Promise<User> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const now = new Date();
    const update = {
      name: payload.name ?? "",
      avatar: payload.avatar ?? "",
      phone: payload.phone ?? "",
      email: payload.email ?? "",
      address: payload.address ?? "",
      updatedAt: now,
    };
    const doc = await db.collection("users").findOneAndUpdate(
      { _id: payload.id as any },
      { $set: update, $setOnInsert: { createdAt: now } },
      { upsert: true, returnDocument: "after" }
    );
    if (!doc) throw new Error("Failed to upsert user");
    return {
      id: (doc._id as any) as string,
      name: doc.name,
      avatar: doc.avatar,
      phone: doc.phone,
      email: doc.email,
      address: doc.address,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },

  async getById(id: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("users").findOne({ _id: id as any });
    return doc ? {
      id: (doc._id as any) as string,
      name: doc.name,
      avatar: doc.avatar,
      phone: doc.phone,
      email: doc.email,
      address: doc.address,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } : null;
  },
};
