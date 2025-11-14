import { NextRequest, NextResponse } from "next/server";
import { getBannerByIdUseCase, updateBannerUseCase, deleteBannerUseCase } from "../depends";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = Number(id);
    if (isNaN(bannerId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const useCase = await getBannerByIdUseCase();
    const result = await useCase.execute({ id: bannerId });
    if (!result.banner) return NextResponse.json({ message: "Banner not found" }, { status: 404 });
    return NextResponse.json(result.banner);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching banner" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = Number(id);
    if (isNaN(bannerId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const useCase = await updateBannerUseCase();
    const result = await useCase.execute({ id: bannerId, ...body });
    if (!result.banner) return NextResponse.json({ message: "Banner not found" }, { status: 404 });
    return NextResponse.json(result.banner);
  } catch (error) {
    return NextResponse.json({ message: "Error updating banner" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = Number(id);
    if (isNaN(bannerId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const useCase = await deleteBannerUseCase();
    const result = await useCase.execute({ id: bannerId });
    if (!result.success) return NextResponse.json({ message: "Banner not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting banner" }, { status: 500 });
  }
}
