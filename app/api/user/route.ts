import { NextRequest, NextResponse } from "next/server";
import { upsertUserUseCase } from "./depends";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const useCase = await upsertUserUseCase();
  const result = await useCase.execute(body);
  return NextResponse.json(result.user);
}
