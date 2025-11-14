import type { Banner } from "@/core/domain/banner"
import type { BannerService, BannerPayload } from "@/core/application/interfaces/banner-service"

export interface UpdateBannerRequest extends BannerPayload {}

export interface UpdateBannerResponse {
  banner: Banner | null
}

export class UpdateBannerUseCase {
  constructor(private bannerService: BannerService) {}

  async execute(request: UpdateBannerRequest): Promise<UpdateBannerResponse> {
    const banner = await this.bannerService.update(request)
    return { banner }
  }
}
