import type { CampaignService, CampaignPayload } from "@/core/application/interfaces/marketing/campaign-service"
import type { Campaign } from "@/core/domain/marketing/campaign"
import { validateCampaign, determineCampaignStatus } from "@/core/domain/marketing/campaign"

export interface CreateCampaignRequest extends CampaignPayload { }

export interface CreateCampaignResponse {
  campaign: Campaign
}

export class CreateCampaignUseCase {
  constructor(private campaignService: CampaignService) { }

  async execute(request: CreateCampaignRequest): Promise<CreateCampaignResponse> {
    // Validate campaign data
    const errors = validateCampaign(request)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    // Auto-determine status if not provided
    if (request.startDate && request.endDate && !request.status) {
      request.status = determineCampaignStatus(request.startDate, request.endDate)
    }

    const campaign = await this.campaignService.create(request)
    return { campaign }
  }
}
