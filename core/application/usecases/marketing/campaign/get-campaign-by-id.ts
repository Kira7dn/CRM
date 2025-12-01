import type { CampaignService } from "@/core/application/interfaces/marketing/campaign-service"
import type { Campaign } from "@/core/domain/marketing/campaign"

export interface GetCampaignByIdRequest {
  id: number
}

export interface GetCampaignByIdResponse {
  campaign: Campaign | null
}

export class GetCampaignByIdUseCase {
  constructor(private campaignService: CampaignService) { }

  async execute(request: GetCampaignByIdRequest): Promise<GetCampaignByIdResponse> {
    const campaign = await this.campaignService.getById(request.id)
    return { campaign }
  }
}
