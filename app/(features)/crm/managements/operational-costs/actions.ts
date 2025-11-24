"use server"

import { revalidatePath } from "next/cache"
import { getCostsUseCase, createCostUseCase, updateCostUseCase, deleteCostUseCase } from "@/app/api/operational-costs/depends"
import type { CostCategory, CostType } from "@/core/domain/managements/operational-cost"

export async function getCostsAction() {
  const useCase = await getCostsUseCase()
  const result = await useCase.execute()
  return result.costs
}

export async function createCostAction(formData: FormData) {
  const useCase = await createCostUseCase()
  await useCase.execute({
    category: formData.get("category")?.toString() as CostCategory,
    type: formData.get("type")?.toString() as CostType,
    amount: parseFloat(formData.get("amount")?.toString() || "0"),
    description: formData.get("description")?.toString() || "",
    date: new Date(formData.get("date")?.toString() || ""),
    orderId: formData.get("orderId")?.toString() ? parseInt(formData.get("orderId")?.toString() || "0") : undefined,
    notes: formData.get("notes")?.toString() || undefined
  })

  revalidatePath("/crm/managements/operational-costs")
}

export async function updateCostAction(formData: FormData) {
  const useCase = await updateCostUseCase()
  await useCase.execute({
    id: parseInt(formData.get("id")?.toString() || "0"),
    category: formData.get("category")?.toString() as CostCategory,
    type: formData.get("type")?.toString() as CostType,
    amount: parseFloat(formData.get("amount")?.toString() || "0"),
    description: formData.get("description")?.toString() || "",
    date: new Date(formData.get("date")?.toString() || ""),
    orderId: formData.get("orderId")?.toString() ? parseInt(formData.get("orderId")?.toString() || "0") : undefined,
    notes: formData.get("notes")?.toString() || undefined
  })

  revalidatePath("/crm/managements/operational-costs")
}

export async function deleteCostAction(id: number | FormData) {
  const costId = typeof id === 'number' ? id : parseInt(id.get("id")?.toString() || "0")
  const useCase = await deleteCostUseCase()
  await useCase.execute({ id: costId })
  revalidatePath("/crm/managements/operational-costs")
}
