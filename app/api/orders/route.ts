import { NextRequest, NextResponse } from "next/server";
import { getOrdersUseCase, createOrderUseCase } from "@/lib/container";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || undefined;
    const zaloUserId = url.searchParams.get("zaloUserId") || undefined;
    const result = await getOrdersUseCase.execute({ status, zaloUserId });
    return NextResponse.json(result.orders);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createOrderUseCase.execute(body);
    return NextResponse.json(result.order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}
