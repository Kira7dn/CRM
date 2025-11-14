import { NextRequest, NextResponse } from "next/server";
import { getOrderByIdUseCase, updateOrderUseCase, deleteOrderUseCase } from "../depends";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const useCase = await getOrderByIdUseCase();
    const result = await useCase.execute({ id: orderId });
    if (!result.order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    return NextResponse.json(result.order);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching order" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const useCase = await updateOrderUseCase();
    const result = await useCase.execute({ id: orderId, payload: body });
    if (!result.order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    return NextResponse.json(result.order);
  } catch (error) {
    return NextResponse.json({ message: "Error updating order" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const useCase = await deleteOrderUseCase();
    const result = await useCase.execute({ id: orderId });
    if (!result.success) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting order" }, { status: 500 });
  }
}
