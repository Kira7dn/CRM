import { NextRequest, NextResponse } from "next/server";
import { getBannersUseCase, createBannerUseCase } from "@/lib/container";

export async function GET() {
  const result = await getBannersUseCase.execute({ detailed: false });
  return NextResponse.json(result.banners);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createBannerUseCase.execute(body);
  return NextResponse.json(result.banner, { status: 201 });
}
