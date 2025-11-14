import type { BannerService } from "@/core/application/interfaces/banner-service";
import type { Banner } from "@/core/domain/banner";

export interface GetBannersRequest {}

export interface GetBannersResponse {
  banners: Banner[];
}

export class GetBannersUseCase {
  constructor(private bannerService: BannerService) {}

  async execute(request: GetBannersRequest): Promise<GetBannersResponse> {
    const banners = await this.bannerService.getAll();
    return { banners };
  }
}
