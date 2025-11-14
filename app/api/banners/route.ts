import { NextRequest, NextResponse } from "next/server";
import { getBannersUseCase, createBannerUseCase } from "./depends";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const useCase = await getBannersUseCase();
    const result = await useCase.execute({ detailed });
    return NextResponse.json(result.banners);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching banners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 });
    }

    const useCase = await createBannerUseCase();
    const result = await useCase.execute(body);
    return NextResponse.json(result.banner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating banner" }, { status: 500 });
  }
}
