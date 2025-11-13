import { describe, beforeAll, afterAll, it, expect, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import type { Product, SizeOption } from '@/core/domain/product';

let mongo: MongoMemoryServer;
let uri: string;
let client: MongoClient;

describe('productRepository (integration)', () => {
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
    });
    uri = mongo.getUri();
    process.env.MONGODB_URI = uri;
    process.env.MONGODB_DB = 'testdb';
    client = new MongoClient(uri);
    await client.connect();
  }, 60000);

  afterAll(async () => {
    if (client) {
      await client.close();
    }
    if (mongo) {
      await mongo.stop();
    }
  });

  beforeEach(async () => {
    // Clear products collection before each test
    const db = client.db('testdb');
    await db.collection('products').deleteMany({});
  });

  it('should create a product with basic fields', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const product = await productRepository.create({
      categoryId: 1,
      name: 'Fresh Crab',
      price: 200000,
      originalPrice: 250000,
      image: 'https://example.com/crab.jpg',
      detail: 'Fresh crab from Cô Tô island',
    });

    expect(product.id).toBeDefined();
    expect(product.name).toBe('Fresh Crab');
    expect(product.price).toBe(200000);
    expect(product.categoryId).toBe(1);
    expect(product.createdAt).toBeInstanceOf(Date);
  });

  it('should create a product with sizes and colors', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const sizes: SizeOption[] = [
      { label: 'Small', price: 100000, originalPrice: 120000 },
      { label: 'Large', price: 200000, originalPrice: 250000 },
    ];

    const product = await productRepository.create({
      categoryId: 1,
      name: 'Premium Shrimp',
      price: 150000,
      sizes,
      colors: ['red', 'orange'],
    });

    expect(product.sizes).toBeDefined();
    expect(product.sizes).toHaveLength(2);
    expect(product.sizes?.[0].label).toBe('Small');
    expect(product.colors).toEqual(['red', 'orange']);
  });

  it('should get product by id', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const created = await productRepository.create({
      categoryId: 1,
      name: 'Test Product',
      price: 100000,
    });

    const fetched = await productRepository.getById(created.id);

    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(created.id);
    expect(fetched?.name).toBe('Test Product');
  });

  it('should return null when product not found', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const product = await productRepository.getById(9999);

    expect(product).toBeNull();
  });

  it('should update a product', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const created = await productRepository.create({
      categoryId: 1,
      name: 'Original Name',
      price: 100000,
    });

    const updated = await productRepository.update(created.id, {
      name: 'Updated Name',
      price: 150000,
    });

    expect(updated).toBeDefined();
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.price).toBe(150000);
    expect(updated?.updatedAt).toBeInstanceOf(Date);
  });

  it('should filter products by categoryId', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    await productRepository.create({ categoryId: 1, name: 'Product 1', price: 100000 });
    await productRepository.create({ categoryId: 1, name: 'Product 2', price: 200000 });
    await productRepository.create({ categoryId: 2, name: 'Product 3', price: 300000 });

    const products = await productRepository.filter({ categoryId: 1 });

    expect(products).toHaveLength(2);
    expect(products.every(p => p.categoryId === 1)).toBe(true);
  });

  it('should filter products by search keyword', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    await productRepository.create({ categoryId: 1, name: 'Fresh Crab', price: 200000 });
    await productRepository.create({ categoryId: 1, name: 'Dried Crab', price: 150000 });
    await productRepository.create({ categoryId: 1, name: 'Fresh Shrimp', price: 100000 });

    const products = await productRepository.filter({ search: 'crab' });

    expect(products).toHaveLength(2);
    expect(products.every(p => p.name.toLowerCase().includes('crab'))).toBe(true);
  });

  it('should filter products by both categoryId and search', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    await productRepository.create({ categoryId: 1, name: 'Fresh Crab', price: 200000 });
    await productRepository.create({ categoryId: 1, name: 'Dried Shrimp', price: 100000 });
    await productRepository.create({ categoryId: 2, name: 'Fresh Crab', price: 250000 });

    const products = await productRepository.filter({ categoryId: 1, search: 'crab' });

    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Fresh Crab');
    expect(products[0].categoryId).toBe(1);
  });

  it('should delete a product', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const created = await productRepository.create({
      categoryId: 1,
      name: 'To Delete',
      price: 100000,
    });

    const deleted = await productRepository.delete(created.id);
    expect(deleted).toBe(true);

    const fetched = await productRepository.getById(created.id);
    expect(fetched).toBeNull();
  });

  it('should return false when deleting non-existent product', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const deleted = await productRepository.delete(9999);
    expect(deleted).toBe(false);
  });

  it('should handle string sizes and normalize them', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const db = client.db('testdb');
    await db.collection('products').insertOne({
      _id: 1,
      categoryId: 1,
      name: 'Test Product',
      price: 100000,
      originalPrice: 120000,
      image: '',
      detail: '',
      sizes: ['Small', 'Medium', 'Large'] as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const product = await productRepository.getById(1);

    expect(product?.sizes).toBeDefined();
    expect(product?.sizes).toHaveLength(3);
    expect(product?.sizes?.[0]).toEqual({
      label: 'Small',
      price: 100000,
      originalPrice: 120000,
    });
  });

  it('should auto-increment product IDs', async () => {
    const { productRepository } = await import('@/infrastructure/repositories/product-repo');

    const product1 = await productRepository.create({
      categoryId: 1,
      name: 'Product 1',
      price: 100000,
    });

    const product2 = await productRepository.create({
      categoryId: 1,
      name: 'Product 2',
      price: 200000,
    });

    expect(product2.id).toBeGreaterThan(product1.id);
  });
});
