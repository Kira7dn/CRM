import { NextRequest, NextResponse } from "next/server";
import { getStationByIdUseCase, updateStationUseCase, deleteStationUseCase } from "../depends";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stationId = Number(id);
    if (isNaN(stationId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const useCase = await getStationByIdUseCase();
    const result = await useCase.execute({ id: stationId });
    if (!result.station) return NextResponse.json({ message: "Station not found" }, { status: 404 });
    return NextResponse.json(result.station);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching station" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stationId = Number(id);
    if (isNaN(stationId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const useCase = await updateStationUseCase();
    const result = await useCase.execute({ id: stationId, ...body });
    if (!result.station) return NextResponse.json({ message: "Station not found" }, { status: 404 });
    return NextResponse.json(result.station);
  } catch (error) {
    return NextResponse.json({ message: "Error updating station" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stationId = Number(id);
    if (isNaN(stationId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const useCase = await deleteStationUseCase();
    const result = await useCase.execute({ id: stationId });
    if (!result.success) return NextResponse.json({ message: "Station not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting station" }, { status: 500 });
  }
}
