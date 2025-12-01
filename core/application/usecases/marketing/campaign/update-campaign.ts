import type { CampaignService, CampaignPayload } from "@/core/application/interfaces/marketing/campaign-service"
import type { Campaign } from "@/core/domain/marketing/campaign"
import { validateCampaign } from "@/core/domain/marketing/campaign"

export interface UpdateCampaignRequest {
  id: number
  payload: CampaignPayload
}

export interface UpdateCampaignResponse {
  campaign: Campaign | null
}

export class UpdateCampaignUseCase {
  constructor(private campaignService: CampaignService) { }

  async execute(request: UpdateCampaignRequest): Promise<UpdateCampaignResponse> {
    // Validate campaign data
    const errors = validateCampaign(request.payload)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    const campaign = await this.campaignService.update({ id: request.id, ...request.payload })
    return { campaign }
  }
}
