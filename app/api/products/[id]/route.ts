import { NextRequest, NextResponse } from "next/server";
import { getProductByIdUseCase, updateProductUseCase, deleteProductUseCase } from "../depends";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const useCase = await getProductByIdUseCase();
    const result = await useCase.execute({ id: productId });
    if (!result.product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(result.product);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const useCase = await updateProductUseCase();
    const result = await useCase.execute({ id: productId, ...body });
    if (!result.product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(result.product);
  } catch (error) {
    return NextResponse.json({ message: "Error updating product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const useCase = await deleteProductUseCase();
    const result = await useCase.execute({ id: productId });
    if (!result.success) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting product" }, { status: 500 });
  }
}
