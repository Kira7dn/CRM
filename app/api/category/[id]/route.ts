import { NextRequest, NextResponse } from "next/server";
import { GetCategoryByIdUseCase } from "@/core/application/usecases/category/get-category-by-id";
import { UpdateCategoryUseCase } from "@/core/application/usecases/category/update-category";
import { DeleteCategoryUseCase } from "@/core/application/usecases/category/delete-category";
import { categoryService } from "@/lib/container";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = Number(id);
  if (isNaN(categoryId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  const useCase = new GetCategoryByIdUseCase(categoryService);
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
  const useCase = new UpdateCategoryUseCase(categoryService);
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
  const useCase = new DeleteCategoryUseCase(categoryService);
  const result = await useCase.execute({ id: categoryId });
  if (!result.success) return NextResponse.json({ message: "Category not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
