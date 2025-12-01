import type { CampaignService } from "@/core/application/interfaces/marketing/campaign-service"

export interface DeleteCampaignRequest {
  id: number
}

export interface DeleteCampaignResponse {
  success: boolean
}

export class DeleteCampaignUseCase {
  constructor(private campaignService: CampaignService) {}

  async execute(request: DeleteCampaignRequest): Promise<DeleteCampaignResponse> {
    const success = await this.campaignService.delete(request.id)
    return { success }
  }
}
