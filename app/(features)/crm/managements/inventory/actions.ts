"use server"

import { revalidatePath } from "next/cache"
import {
  recordStockMovementUseCase,
  getStockMovementsUseCase,
  getInventorySummaryUseCase,
  getAllInventorySummariesUseCase,
  updateInventoryConfigUseCase
} from "@/app/api/inventory/depends"

// Get all stock movements
export async function getInventoryAction() {
  const useCase = await getStockMovementsUseCase()
  const result = await useCase.execute({})
  return result.movements
}

// Create initial inventory with an "in" movement
export async function createInventoryAction(formData: FormData) {
  const useCase = await recordStockMovementUseCase()
  await useCase.execute({
    productId: parseInt(formData.get("productId")?.toString() || "0"),
    type: "in" as const,
    quantity: parseInt(formData.get("quantity")?.toString() || "0"),
    unitCost: parseFloat(formData.get("unitCost")?.toString() || "0"),
    reason: formData.get("reason")?.toString() || "Initial inventory",
    performedBy: formData.get("performedBy")?.toString(),
    notes: formData.get("notes")?.toString(),
  })
  revalidatePath("/crm/managements/inventory")
}

// Update inventory configuration (reorder points, etc.)
export async function updateInventoryAction(formData: FormData) {
  const useCase = await updateInventoryConfigUseCase()
  await useCase.execute({
    productId: parseInt(formData.get("productId")?.toString() || "0"),
    reorderPoint: parseInt(formData.get("reorderPoint")?.toString() || "0"),
    reorderQuantity: parseInt(formData.get("reorderQuantity")?.toString() || "0"),
  })
  revalidatePath("/crm/managements/inventory")
}

// Add a stock movement (in/out/adjustment)
export async function addStockMovementAction(formData: FormData) {
  const useCase = await recordStockMovementUseCase()
  await useCase.execute({
    productId: parseInt(formData.get("productId")?.toString() || "0"),
    type: formData.get("type") as "in" | "out" | "adjustment" | "return",
    quantity: parseInt(formData.get("quantity")?.toString() || "0"),
    unitCost: parseFloat(formData.get("unitCost")?.toString() || "0"),
    referenceOrderId: formData.get("referenceOrderId")
      ? parseInt(formData.get("referenceOrderId")!.toString())
      : undefined,
    reason: formData.get("reason")?.toString(),
    performedBy: formData.get("performedBy")?.toString(),
    notes: formData.get("notes")?.toString(),
  })
  revalidatePath("/crm/managements/inventory")
}

// Get inventory summary for a specific product
export async function getInventorySummaryAction(productId: number) {
  const useCase = await getInventorySummaryUseCase()
  const result = await useCase.execute({ productId })
  return result.summary
}

// Get inventory summaries for all products
export async function getAllInventorySummariesAction() {
  const useCase = await getAllInventorySummariesUseCase()
  const result = await useCase.execute()
  return result.summaries
}
