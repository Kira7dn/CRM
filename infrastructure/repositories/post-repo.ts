import type { Post } from "@/core/domain/post"
import type { PostService, PostPayload } from "@/core/application/interfaces/post-service"
import clientPromise from "@/infrastructure/db/mongo"
import { ObjectId } from "mongodb"

/**
 * MongoDB document - uses Post type with _id mapping
 */
type PostDocument = Omit<Post, 'id'> & { _id: ObjectId };

/**
 * Converts MongoDB document to domain Post entity
 */
function toPost(doc: PostDocument): Post {
  const { _id, ...postData } = doc;
  return {
    ...postData,
    id: _id.toString(), // Convert ObjectId to string
  };
}

export const postRepository: PostService & {
  create(post: Omit<Post, "id">): Promise<Post>
  update(id: string, post: Partial<Post>): Promise<boolean>
  delete(id: string): Promise<boolean>
} = {
  async getAll(): Promise<Post[]> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const docs = await db
      .collection<PostDocument>("posts")
      .find({})
      .sort({ _id: -1 })
      .toArray()
    return docs.map(toPost);
  },

  async create(post: Omit<Post, "id">): Promise<Post> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const doc: Omit<PostDocument, "_id"> = {
      title: post.title,
      body: post.body,
    }
    const { insertedId } = await db.collection<PostDocument>("posts").insertOne(doc as PostDocument)
    const createdDoc = await db.collection<PostDocument>("posts").findOne({ _id: insertedId })
    return createdDoc ? toPost(createdDoc) : { id: insertedId.toString(), ...post }
  },

  async update(id: string, post: Partial<Post>): Promise<boolean> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const updateObj: Partial<PostDocument> = {}
    if (post.title !== undefined) updateObj.title = post.title
    if (post.body !== undefined) updateObj.body = post.body

    const res = await db
      .collection<PostDocument>("posts")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateObj })
    return res.modifiedCount > 0
  },

  async delete(id: string): Promise<boolean> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const res = await db
      .collection<PostDocument>("posts")
      .deleteOne({ _id: new ObjectId(id) })
    return res.deletedCount > 0
  },
}
