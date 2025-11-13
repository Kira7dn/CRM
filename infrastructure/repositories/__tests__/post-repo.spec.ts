import { describe, beforeAll, afterAll, it, expect } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'

let mongo: MongoMemoryServer
let uri: string
let client: MongoClient

describe('postRepository (integration)', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        port: undefined,
        ip: '127.0.0.1',
        storageEngine: 'wiredTiger',
      },
      binary: {
        downloadDir: './node_modules/.cache/mongodb-memory-server',
      },
    })
    uri = mongo.getUri()
    process.env.MONGODB_URI = uri
    process.env.MONGODB_DB = 'testdb'
    client = new MongoClient(uri)
    await client.connect()
  }, 60000) // 60 seconds timeout for MongoMemoryServer

  afterAll(async () => {
    if (client) {
      await client.close()
    }
    if (mongo) {
      await mongo.stop()
    }
  })

  it('should insert and fetch posts', async () => {
    const { postRepository } = await import('@/infrastructure/repositories/post-repo')
    const created = await postRepository.create({ title: 'Test', body: '123' })
    expect(created.id).toBeDefined()

    const all = await postRepository.getAll()
    expect(all.length).toBe(1)
    expect(all[0].title).toBe('Test')
  })
})
