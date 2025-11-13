import { NextRequest, NextResponse } from "next/server";
import { GetOrderByIdUseCase } from "@/core/application/usecases/order/get-order-by-id";
import { UpdateOrderUseCase } from "@/core/application/usecases/order/update-order";
import { DeleteOrderUseCase } from "@/core/application/usecases/order/delete-order";
import { orderService } from "@/lib/container";

const getOrderByIdUseCase = new GetOrderByIdUseCase(orderService);
const updateOrderUseCase = new UpdateOrderUseCase(orderService);
const deleteOrderUseCase = new DeleteOrderUseCase(orderService);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  const result = await getOrderByIdUseCase.execute({ id: orderId });
  if (!result.order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  return NextResponse.json(result.order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  const body = await request.json();
  const result = await updateOrderUseCase.execute({ id: orderId, ...body });
  if (!result.order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  return NextResponse.json(result.order);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  const result = await deleteOrderUseCase.execute({ id: orderId });
  if (!result.success) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
