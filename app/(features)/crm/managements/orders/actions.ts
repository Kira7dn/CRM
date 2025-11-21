"use server"

import { revalidatePath } from "next/cache"
import {
  getOrdersUseCase,
  createOrderUseCase,
  updateOrderUseCase,
  deleteOrderUseCase,
} from "@/app/api/orders/depends"
import type { OrderStatus } from "@/core/domain/managements/order"

export async function getOrdersAction(status?: OrderStatus, customerId?: string, platformSource?: string) {
  const useCase = await getOrdersUseCase()
  const result = await useCase.execute({ status, customerId, platformSource })
  return result.orders
}

export async function createOrderAction(formData: FormData) {
  const useCase = await createOrderUseCase()

  // Parse items
  const itemsJson = formData.get("items")?.toString()
  const items = itemsJson ? JSON.parse(itemsJson) : []

  // Parse delivery
  const deliveryJson = formData.get("delivery")?.toString()
  const delivery = deliveryJson ? JSON.parse(deliveryJson) : {}

  // Parse payment
  const paymentMethod = formData.get("paymentMethod")?.toString() as "cod" | "bank_transfer" | "zalopay" | "momo" | undefined
  const shippingFee = parseFloat(formData.get("shippingFee")?.toString() || "0")
  const discount = parseFloat(formData.get("discount")?.toString() || "0")

  // Calculate total amount from items
  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
  const finalAmount = totalAmount + shippingFee - discount

  await useCase.execute({
    customerId: formData.get("customerId")?.toString() || "",
    items,
    delivery,
    payment: paymentMethod ? {
      method: paymentMethod,
      status: "pending",
      amount: finalAmount
    } : undefined,
    shippingFee: parseFloat(formData.get("shippingFee")?.toString() || "0"),
    discount: parseFloat(formData.get("discount")?.toString() || "0"),
    platformOrderId: formData.get("platformOrderId")?.toString(),
    platformSource: formData.get("platformSource")?.toString(),
    note: formData.get("note")?.toString(),
    tags: formData.get("tags")?.toString()?.split(",").map(t => t.trim()).filter(Boolean),
  })

  revalidatePath("/orders")
}

export async function updateOrderAction(formData: FormData) {
  const useCase = await updateOrderUseCase()

  const id = parseInt(formData.get("id")?.toString() || "0")
  const status = formData.get("status")?.toString() as OrderStatus | undefined
  const paymentStatus = formData.get("paymentStatus")?.toString() as "pending" | "success" | "failed" | "refunded" | undefined

  const payload: any = {
    status,
    note: formData.get("note")?.toString(),
  }

  // Only update payment status if provided
  if (paymentStatus) {
    payload.payment = {
      status: paymentStatus,
    }
  }

  await useCase.execute({
    id,
    payload
  })

  revalidatePath("/orders")
}

export async function deleteOrderAction(id: number) {
  const useCase = await deleteOrderUseCase()
  await useCase.execute({ id })
  revalidatePath("/orders")
}
