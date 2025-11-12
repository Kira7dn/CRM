import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import type { AddressInfo } from "net";

// Toggle running API tests (disabled by default to avoid slow Next.js startup)
const RUN_API_TESTS = process.env.RUN_API_TESTS === 'true';

// Mock DB setup (similar to backend setup)
beforeAll(async () => {
  if (!RUN_API_TESTS) return;
  // Start Next.js server in dev mode to avoid requiring a production build
  const app = next({ dev: true });
  await app.prepare();
  const handle = app.getRequestHandler();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve()); // bind to random available port
  });

  const addr = server.address() as AddressInfo;
  (global as any).testServer = server;
  (global as any).baseUrl = `http://127.0.0.1:${addr.port}`;
}, 30000); // Increase timeout to 30 seconds

afterAll(async () => {
  const srv = (global as any).testServer as ReturnType<typeof createServer> | undefined;
  if (srv) {
    await new Promise<void>((resolve) => {
      srv.close(() => resolve());
    });
  }
});

beforeEach(async () => {
  // Seed test data if needed
});

const getBaseUrl = () => (global as any).baseUrl as string;

const describeMaybe = RUN_API_TESTS ? describe : describe.skip;

describeMaybe("Next.js API Integration Tests", () => {
  it("GET /api/health returns OK", async () => {
    const res = await fetch(`${getBaseUrl()}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe("string");
  }, 15000); // 15 seconds timeout

  it("CRUD categories", async () => {
    // Create
    const createRes = await fetch(`${getBaseUrl()}/api/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Category",
        description: "Test description",
      }),
    });
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.id).toBeDefined();
    const categoryId = createData.id;

    // Read
    const getRes = await fetch(`${getBaseUrl()}/api/category/${categoryId}`);
    const getData = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(getData.id).toBe(categoryId);

    // Update
    const updateRes = await fetch(`${getBaseUrl()}/api/category/${categoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Updated Test Category",
        description: "Updated description",
      }),
    });
    expect(updateRes.status).toBe(200);

    // Verify update
    const getUpdatedRes = await fetch(`${getBaseUrl()}/api/category/${categoryId}`);
    const getUpdatedData = await getUpdatedRes.json();
    expect(getUpdatedRes.status).toBe(200);
    expect(getUpdatedData.name).toBe("Updated Test Category");

    // Delete
    const deleteRes = await fetch(`${getBaseUrl()}/api/category/${categoryId}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(204);
  }, 15000); // 15 seconds timeout

  it("CRUD products", async () => {
    // Create category first
    const categoryRes = await fetch(`${getBaseUrl()}/api/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Product Test Category",
        description: "For product testing",
      }),
    });
    const categoryData = await categoryRes.json();
    const categoryId = categoryData.id;

    // Create product
    const createRes = await fetch(`${getBaseUrl()}/api/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Product",
        description: "Test product description",
        price: 100,
        categoryId,
      }),
    });
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    expect(createData.id).toBeDefined();
    const productId = createData.id;

    // Read
    const getRes = await fetch(`${getBaseUrl()}/api/product/${productId}`);
    const getData = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(getData.id).toBe(productId);

    // Update
    const updateRes = await fetch(`${getBaseUrl()}/api/product/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Updated Test Product",
        price: 150,
      }),
    });
    expect(updateRes.status).toBe(200);

    // Delete
    const deleteRes = await fetch(`${getBaseUrl()}/api/product/${productId}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(204);

    // Cleanup category
    await fetch(`${getBaseUrl()}/api/category/${categoryId}`, {
      method: "DELETE",
    });
  }, 15000); // 15 seconds timeout
});
