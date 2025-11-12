import type { Post } from "@/core/domain/post"
import type { PostService } from "@/core/application/interfaces/post-service"
import clientPromise from "@/infrastructure/db/mongo"
import { ObjectId } from "mongodb"

export const postRepository: PostService & {
  create(post: Omit<Post, "id">): Promise<Post>
  update(id: string, post: Partial<Post>): Promise<boolean>
  delete(id: string): Promise<boolean>
} = {
  async getAll(): Promise<Post[]> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const docs = await db
      .collection("posts")
      .find({})
      .sort({ _id: -1 })
      .toArray()
    return docs.map((d: any) => ({
      id: String(d._id),
      title: String(d.title ?? "Untitled"),
      body: typeof d.body === "string" ? d.body : undefined,
    }))
  },

  async create(post: Omit<Post, "id">): Promise<Post> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const { insertedId } = await db.collection("posts").insertOne({
      title: post.title,
      body: post.body ?? null,
    })
    return { id: String(insertedId), title: post.title, body: post.body }
  },

  async update(id: string, post: Partial<Post>): Promise<boolean> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const res = await db
      .collection("posts")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...post } })
    return res.modifiedCount > 0
  },

  async delete(id: string): Promise<boolean> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const res = await db
      .collection("posts")
      .deleteOne({ _id: new ObjectId(id) })
    return res.deletedCount > 0
  },
}
