import { NextRequest, NextResponse } from "next/server";
import { getCategoriesUseCase, createCategoryUseCase } from "@/lib/container";

export async function GET() {
  try {
    const result = await getCategoriesUseCase.execute();
    return NextResponse.json(result.categories);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createCategoryUseCase.execute(body);
    return NextResponse.json(result.category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating category" }, { status: 500 });
  }
}
