import type { MongoClient } from 'mongodb';

export const getNextId = async (client: MongoClient, collectionName: string): Promise<number> => {
  const db = client.db(process.env.MONGODB_DB);
  const docs = await db.collection(collectionName)
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  if (docs.length === 0) return 1;

  // Since we store numeric IDs as _id, we need to convert to number
  const lastId = docs[0]._id;
  const numericId = typeof lastId === 'number' ? lastId : Number(lastId);
  return numericId + 1;
};
