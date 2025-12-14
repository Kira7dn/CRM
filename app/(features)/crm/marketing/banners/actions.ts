"use server"

import { revalidatePath } from "next/cache"
import {
  getBannersUseCase,
  createBannerUseCase,
  updateBannerUseCase,
  deleteBannerUseCase,
} from "@/app/api/banners/depends"

export async function getBannersAction() {
  const useCase = await getBannersUseCase()
  const result = await useCase.execute({})
  return result.banners
}

export async function createBannerAction(formData: FormData) {
  const useCase = await createBannerUseCase()

  await useCase.execute({
    url: formData.get("url")?.toString() || "",
  })

  revalidatePath("/banners")
}

export async function updateBannerAction(formData: FormData) {
  const useCase = await updateBannerUseCase()

  await useCase.execute({
    id: parseInt(formData.get("id")?.toString() || "0"),
    url: formData.get("url")?.toString(),
  })

  revalidatePath("/banners")
}

export async function deleteBannerAction(id: number) {
  const useCase = await deleteBannerUseCase()
  await useCase.execute({ id })
  revalidatePath("/banners")
}
