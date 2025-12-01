import { campaignRepository } from "@/infrastructure/repositories/marketing/campaign-repo"
import type { CampaignService } from "@/core/application/interfaces/marketing/campaign-service"
import { GetAllCampaignsUseCase } from "@/core/application/usecases/marketing/campaign/get-all-campaigns"
import { GetCampaignByIdUseCase } from "@/core/application/usecases/marketing/campaign/get-campaign-by-id"
import { GetCampaignsByStatusUseCase } from "@/core/application/usecases/marketing/campaign/get-campaigns-by-status"
import { CreateCampaignUseCase } from "@/core/application/usecases/marketing/campaign/create-campaign"
import { UpdateCampaignUseCase } from "@/core/application/usecases/marketing/campaign/update-campaign"
import { DeleteCampaignUseCase } from "@/core/application/usecases/marketing/campaign/delete-campaign"

const createCampaignRepository = async (): Promise<CampaignService> => {
  return campaignRepository
}

export const getAllCampaignsUseCase = async () => {
  const service = await createCampaignRepository()
  return new GetAllCampaignsUseCase(service)
}

export const getCampaignByIdUseCase = async () => {
  const service = await createCampaignRepository()
  return new GetCampaignByIdUseCase(service)
}

export const getCampaignsByStatusUseCase = async () => {
  const service = await createCampaignRepository()
  return new GetCampaignsByStatusUseCase(service)
}

export const createCampaignUseCase = async () => {
  const service = await createCampaignRepository()
  return new CreateCampaignUseCase(service)
}

export const updateCampaignUseCase = async () => {
  const service = await createCampaignRepository()
  return new UpdateCampaignUseCase(service)
}

export const deleteCampaignUseCase = async () => {
  const service = await createCampaignRepository()
  return new DeleteCampaignUseCase(service)
}
