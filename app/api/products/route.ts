import { NextRequest, NextResponse } from "next/server";
import { filterProductsUseCase, createProductUseCase } from "./depends";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const useCase = await filterProductsUseCase();
    const result = await useCase.execute({ categoryId, search });
    return NextResponse.json(result.products);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = await createProductUseCase();
    const result = await useCase.execute(body);
    return NextResponse.json(result.product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating product" }, { status: 500 });
  }
}
