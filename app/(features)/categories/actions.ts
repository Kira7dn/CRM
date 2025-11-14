"use server"

import { revalidatePath } from "next/cache"
import { getCategoriesUseCase, createCategoryUseCase, updateCategoryUseCase, deleteCategoryUseCase } from "../../api/categories/depends"

export async function createCategoryAction(formData: FormData) {
  const useCase = await createCategoryUseCase()
  await useCase.execute({
    name: formData.get("name")?.toString() || "",
    image: formData.get("image")?.toString() || ""
  })

  revalidatePath("/categories")
}

export async function getCategoriesAction() {
  const useCase = await getCategoriesUseCase()
  const result = await useCase.execute()
  return result.categories
}

export async function updateCategoryAction(formData: FormData) {
  const useCase = await updateCategoryUseCase()
  await useCase.execute({
    id: parseInt(formData.get("id")?.toString() || "0"),
    name: formData.get("name")?.toString(),
    image: formData.get("image")?.toString()
  })

  revalidatePath("/categories")
}

export async function deleteCategoryAction(formData: FormData) {
  const id = parseInt(formData.get("id")?.toString() || "0")
  const useCase = await deleteCategoryUseCase()
  await useCase.execute({ id })
  revalidatePath("/categories")
}
