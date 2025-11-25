import type { CampaignService } from "@/core/application/interfaces/campaign-service"
import type { Campaign } from "@/core/domain/campaigns/campaign"

export interface GetAllCampaignsRequest { }

export interface GetAllCampaignsResponse {
  campaigns: Campaign[]
}

export class GetAllCampaignsUseCase {
  constructor(private campaignService: CampaignService) { }

  async execute(request: GetAllCampaignsRequest): Promise<GetAllCampaignsResponse> {
    const campaigns = await this.campaignService.getAll()
    return { campaigns }
  }
}
