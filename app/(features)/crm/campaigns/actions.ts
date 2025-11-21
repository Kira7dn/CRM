"use server"

import { revalidatePath } from "next/cache"
import {
  getAllCampaignsUseCase,
  getCampaignsByStatusUseCase,
  createCampaignUseCase,
  updateCampaignUseCase,
  deleteCampaignUseCase,
} from "@/app/api/campaigns/depends"
import type { CampaignStatus, CampaignType } from "@/core/domain/managements/campaign"

export async function getCampaignsAction(status?: CampaignStatus) {
  try {
    if (status) {
      const useCase = await getCampaignsByStatusUseCase()
      const result = await useCase.execute({ status })
      return result.campaigns
    }

    const useCase = await getAllCampaignsUseCase()
    const result = await useCase.execute({})
    return result.campaigns
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return []
  }
}

export async function createCampaignAction(formData: FormData) {
  try {
    const platformsJson = formData.get("platforms")?.toString() || "[]"
    const productsJson = formData.get("products")?.toString() || "[]"

    const payload = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      image: formData.get("image")?.toString() || "",
      startDate: new Date(formData.get("startDate")?.toString() || ""),
      endDate: new Date(formData.get("endDate")?.toString() || ""),
      type: formData.get("type")?.toString() as CampaignType,
      products: JSON.parse(productsJson),
      platforms: JSON.parse(platformsJson),
    }

    const useCase = await createCampaignUseCase()
    await useCase.execute(payload)
    revalidatePath("/campaigns")
    return { success: true }
  } catch (error) {
    console.error("Error creating campaign:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create campaign",
    }
  }
}

export async function updateCampaignAction(id: number, formData: FormData) {
  try {
    const platformsJson = formData.get("platforms")?.toString()
    const productsJson = formData.get("products")?.toString()

    const payload: any = {
      name: formData.get("name")?.toString(),
      description: formData.get("description")?.toString(),
      image: formData.get("image")?.toString(),
      type: formData.get("type")?.toString(),
    }

    const startDate = formData.get("startDate")?.toString()
    const endDate = formData.get("endDate")?.toString()

    if (startDate) payload.startDate = new Date(startDate)
    if (endDate) payload.endDate = new Date(endDate)
    if (platformsJson) payload.platforms = JSON.parse(platformsJson)
    if (productsJson) payload.products = JSON.parse(productsJson)

    const useCase = await updateCampaignUseCase()
    await useCase.execute({ id, payload })
    revalidatePath("/campaigns")
    return { success: true }
  } catch (error) {
    console.error("Error updating campaign:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update campaign",
    }
  }
}

export async function deleteCampaignAction(id: number) {
  try {
    const useCase = await deleteCampaignUseCase()
    await useCase.execute({ id })
    revalidatePath("/campaigns")
    return { success: true }
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete campaign",
    }
  }
}
