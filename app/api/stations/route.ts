import { NextRequest, NextResponse } from "next/server";
import { getStationsUseCase, createStationUseCase } from "./depends";

export async function GET() {
  try {
    const useCase = await getStationsUseCase();
    const result = await useCase.execute();
    return NextResponse.json(result.stations);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching stations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = await createStationUseCase();
    const result = await useCase.execute(body);
    return NextResponse.json(result.station, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating station" }, { status: 500 });
  }
}
