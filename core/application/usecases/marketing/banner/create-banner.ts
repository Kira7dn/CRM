import type { Banner } from "@/core/domain/marketing/banner"
import type { BannerService, BannerPayload } from "@/core/application/interfaces/marketing/banner-service"

export interface CreateBannerRequest extends BannerPayload { }

export interface CreateBannerResponse {
  banner: Banner
}

export class CreateBannerUseCase {
  constructor(private bannerService: BannerService) { }

  async execute(request: CreateBannerRequest): Promise<CreateBannerResponse> {
    const banner = await this.bannerService.create(request)
    return { banner }
  }
}
