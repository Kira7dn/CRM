import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI as string
const options = {
  // Connection pool settings for better performance
  maxPoolSize: 10,
  minPoolSize: 2,

  // Timeout settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,

  // Retry settings
  retryWrites: true,
  retryReads: true,

  // Compression for faster network transfer
  compressors: ['zlib'],
} as any

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your environment variables")
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
