import { NextRequest, NextResponse } from "next/server";
import { getOrdersUseCase, createOrderUseCase } from "./depends";
import type { OrderStatus } from "@/core/domain/managements/order";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as OrderStatus | undefined;
    const customerId = url.searchParams.get("customerId") || undefined;
    const platformSource = url.searchParams.get("platformSource") || undefined;
    const useCase = await getOrdersUseCase();
    const result = await useCase.execute({ status, customerId, platformSource });
    return NextResponse.json(result.orders);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch((err) => {
      console.error('[POST /api/orders] Invalid JSON in request body:', err)
      throw new Error('Invalid JSON in request body')
    })

    console.log('[POST /api/orders] Received request:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      body,
    })

    const useCase = await createOrderUseCase();
    const result = await useCase.execute(body)
    console.log('[POST /api/orders] Create order result:', result)

    return NextResponse.json(result.order, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/orders] Error creating order:', {
      error: error.message,
      stack: error.stack,
      body: req.body || 'N/A',
      url: req.url,
    })

    return NextResponse.json(
      { message: 'Failed to create order', error: error.message },
      { status: 500 }
    )
  }
}
