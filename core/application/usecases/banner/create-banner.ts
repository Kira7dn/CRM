import type { Banner } from "@/core/domain/banner"
import type { BannerService, BannerPayload } from "@/core/application/interfaces/banner-service"

export interface CreateBannerRequest extends BannerPayload {}

export interface CreateBannerResponse {
  banner: Banner
}

export class CreateBannerUseCase {
  constructor(private bannerService: BannerService) {}

  async execute(request: CreateBannerRequest): Promise<CreateBannerResponse> {
    const banner = await this.bannerService.create(request)
    return { banner }
  }
}
