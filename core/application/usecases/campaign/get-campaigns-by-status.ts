import type { CampaignService } from "@/core/application/interfaces/campaign-service"
import type { Campaign, CampaignStatus } from "@/core/domain/managements/campaign"

export interface GetCampaignsByStatusRequest {
  status: CampaignStatus
}

export interface GetCampaignsByStatusResponse {
  campaigns: Campaign[]
}

export class GetCampaignsByStatusUseCase {
  constructor(private campaignService: CampaignService) { }

  async execute(request: GetCampaignsByStatusRequest): Promise<GetCampaignsByStatusResponse> {
    const campaigns = await this.campaignService.getByStatus(request.status)
    return { campaigns }
  }
}
