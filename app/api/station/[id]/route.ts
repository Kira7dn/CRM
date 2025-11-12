import { NextRequest, NextResponse } from "next/server";
import { GetStationByIdUseCase } from "@/core/application/usecases/station/get-station-by-id";
import { UpdateStationUseCase } from "@/core/application/usecases/station/update-station";
import { DeleteStationUseCase } from "@/core/application/usecases/station/delete-station";
import { stationService } from "@/lib/container";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stationId = Number(id);
  if (isNaN(stationId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  const useCase = new GetStationByIdUseCase(stationService);
  const result = await useCase.execute({ id: stationId });
  if (!result.station) return NextResponse.json({ message: "Station not found" }, { status: 404 });
  return NextResponse.json(result.station);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stationId = Number(id);
  if (isNaN(stationId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  const body = await request.json();
  const useCase = new UpdateStationUseCase(stationService);
  const result = await useCase.execute({ id: stationId, ...body });
  if (!result.station) return NextResponse.json({ message: "Station not found" }, { status: 404 });
  return NextResponse.json(result.station);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stationId = Number(id);
  if (isNaN(stationId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  const useCase = new DeleteStationUseCase(stationService);
  const result = await useCase.execute({ id: stationId });
  if (!result.success) return NextResponse.json({ message: "Station not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
