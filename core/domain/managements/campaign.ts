export interface CampaignPlatform {
  platform: "facebook" | "tiktok" | "zalo" | "shopee"
  campaignId: string        // External platform campaign ID
  utmParams: {
    source: string
    medium: string
    campaign: string
  }
  metrics?: {
    impressions?: number
    clicks?: number
    ctr?: number
  }
}

export type CampaignStatus = "upcoming" | "active" | "ended"
export type CampaignType = "discount" | "branding" | "kol"

export class Campaign {
  constructor(
    public readonly id: number,
    public name: string,
    public description: string,
    public image: string,
    public startDate: Date,
    public endDate: Date,
    public status: CampaignStatus,
    public type: CampaignType,
    public products: number[],
    public platforms: CampaignPlatform[],
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}

/**
 * Validates campaign data
 */
export function validateCampaign(campaign: Partial<Campaign>): string[] {
  const errors: string[] = []

  if (campaign.name !== undefined && !campaign.name.trim()) {
    errors.push("Campaign name is required")
  }

  if (campaign.startDate && campaign.endDate) {
    if (new Date(campaign.startDate) >= new Date(campaign.endDate)) {
      errors.push("End date must be after start date")
    }
  }

  if (campaign.status && !["upcoming", "active", "ended"].includes(campaign.status)) {
    errors.push("Invalid campaign status")
  }

  if (campaign.type && !["discount", "branding", "kol"].includes(campaign.type)) {
    errors.push("Invalid campaign type")
  }

  return errors
}

/**
 * Determines campaign status based on dates
 */
export function determineCampaignStatus(startDate: Date, endDate: Date): CampaignStatus {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) {
    return "upcoming"
  } else if (now >= start && now <= end) {
    return "active"
  } else {
    return "ended"
  }
}
