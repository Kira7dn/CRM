"use server"

import { revalidatePath } from "next/cache"
import {
  filterProductsUseCase,
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase,
} from "@/app/api/products/depends"

export async function getProductsAction(categoryId?: number, search?: string) {
  const useCase = await filterProductsUseCase()
  const result = await useCase.execute({ categoryId, search })
  return result.products
}

export async function createProductAction(formData: FormData) {
  const useCase = await createProductUseCase()

  // Parse sizes if provided
  const sizesJson = formData.get("sizes")?.toString()
  const sizes = sizesJson ? JSON.parse(sizesJson) : undefined

  // Parse colors if provided
  const colorsJson = formData.get("colors")?.toString()
  const colors = colorsJson ? JSON.parse(colorsJson) : undefined

  await useCase.execute({
    categoryId: parseInt(formData.get("categoryId")?.toString() || "0"),
    name: formData.get("name")?.toString() || "",
    price: parseFloat(formData.get("price")?.toString() || "0"),
    originalPrice: formData.get("originalPrice")?.toString()
      ? parseFloat(formData.get("originalPrice")?.toString() || "0")
      : undefined,
    image: formData.get("image")?.toString(),
    detail: formData.get("detail")?.toString(),
    sizes,
    colors,
  })

  revalidatePath("/products")
}

export async function updateProductAction(formData: FormData) {
  const useCase = await updateProductUseCase()

  // Parse sizes if provided
  const sizesJson = formData.get("sizes")?.toString()
  const sizes = sizesJson ? JSON.parse(sizesJson) : undefined

  // Parse colors if provided
  const colorsJson = formData.get("colors")?.toString()
  const colors = colorsJson ? JSON.parse(colorsJson) : undefined

  await useCase.execute({
    id: parseInt(formData.get("id")?.toString() || "0"),
    categoryId: formData.get("categoryId")?.toString()
      ? parseInt(formData.get("categoryId")?.toString() || "0")
      : undefined,
    name: formData.get("name")?.toString(),
    price: formData.get("price")?.toString()
      ? parseFloat(formData.get("price")?.toString() || "0")
      : undefined,
    originalPrice: formData.get("originalPrice")?.toString()
      ? parseFloat(formData.get("originalPrice")?.toString() || "0")
      : undefined,
    image: formData.get("image")?.toString(),
    detail: formData.get("detail")?.toString(),
    sizes,
    colors,
  })

  revalidatePath("/products")
}

export async function deleteProductAction(id: number) {
  const useCase = await deleteProductUseCase()
  await useCase.execute({ id })
  revalidatePath("/products")
}
