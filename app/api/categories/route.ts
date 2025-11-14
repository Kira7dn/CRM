import { NextRequest, NextResponse } from "next/server";
import { getCategoriesUseCase, createCategoryUseCase } from "./depends";

export async function GET() {
  try {
    const useCase = await getCategoriesUseCase();
    const result = await useCase.execute();
    return NextResponse.json(result.categories);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ message: "Tên danh mục là bắt buộc." }, { status: 400 });
    }

    const useCase = await createCategoryUseCase();
    const result = await useCase.execute(body);
    return NextResponse.json(result.category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating category" }, { status: 500 });
  }
}
