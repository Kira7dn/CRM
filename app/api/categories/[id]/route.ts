import { NextRequest, NextResponse } from "next/server";
import { getCategoryByIdUseCase, updateCategoryUseCase, deleteCategoryUseCase } from "../depends";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = Number(id);
  if (isNaN(categoryId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  
  const useCase = await getCategoryByIdUseCase();
  const result = await useCase.execute({ id: categoryId });
  if (!result.category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
  return NextResponse.json(result.category);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = Number(id);
  if (isNaN(categoryId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  
  const body = await request.json();
  const useCase = await updateCategoryUseCase();
  const result = await useCase.execute({ id: categoryId, ...body });
  if (!result.category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
  return NextResponse.json(result.category);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = Number(id);
  if (isNaN(categoryId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  
  const useCase = await deleteCategoryUseCase();
  const result = await useCase.execute({ id: categoryId });
  if (!result.success) return NextResponse.json({ message: "Category not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
