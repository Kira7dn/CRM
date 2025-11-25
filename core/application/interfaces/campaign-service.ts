import type { Campaign, CampaignStatus } from "@/core/domain/campaigns/campaign"

export interface CampaignPayload extends Partial<Campaign> { }

export interface CampaignService {
  getAll(): Promise<Campaign[]>
  getById(id: number): Promise<Campaign | null>
  getByStatus(status: CampaignStatus): Promise<Campaign[]>
  create(payload: CampaignPayload): Promise<Campaign>
  update(payload: CampaignPayload): Promise<Campaign | null>
  delete(id: number): Promise<boolean>
}
