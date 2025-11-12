import { NextRequest } from "next/server";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "@/app/api/product/route";
import { filterProductsUseCase, createProductUseCase } from "@/lib/container";

// Mock use cases
vi.mock("@/lib/container", () => ({
  filterProductsUseCase: {
    execute: vi.fn(),
  },
  createProductUseCase: {
    execute: vi.fn(),
  },
}));

describe("/api/product", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return products with query params", async () => {
      const mockProducts = [{ id: 1, name: "Test Product" }];
      (filterProductsUseCase.execute as any).mockResolvedValue({
        products: mockProducts,
      });

      const request = new NextRequest("http://localhost/api/product?categoryId=1&search=test");
      const response = await GET(request);
      const data = await response.json();

      expect(filterProductsUseCase.execute).toHaveBeenCalledWith({
        categoryId: "1",
        search: "test",
      });
      expect(response.status).toBe(200);
      expect(data).toEqual(mockProducts);
    });

    it("should handle errors", async () => {
      (filterProductsUseCase.execute as any).mockRejectedValue(new Error("DB error"));

      const request = new NextRequest("http://localhost/api/product");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Error fetching products");
    });
  });

  describe("POST", () => {
    it("should create product", async () => {
      const mockProduct = { id: 1, name: "New Product" };
      const body = { name: "New Product", price: 100 };
      (createProductUseCase.execute as any).mockResolvedValue({
        product: mockProduct,
      });

      const request = new NextRequest("http://localhost/api/product", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(createProductUseCase.execute).toHaveBeenCalledWith(body);
      expect(response.status).toBe(201);
      expect(data).toEqual(mockProduct);
    });

    it("should handle creation errors", async () => {
      (createProductUseCase.execute as any).mockRejectedValue(new Error("Validation error"));

      const request = new NextRequest("http://localhost/api/product", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Error creating product");
    });
  });
});
