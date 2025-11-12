import type { BannerService } from "@/core/application/interfaces/banner-service";

export interface GetBannersRequest {
  detailed?: boolean;
}

export interface GetBannersResponse {
  banners: any[]; // or specific type
}

export class GetBannersUseCase {
  constructor(private bannerService: BannerService) {}

  async execute(request: GetBannersRequest): Promise<GetBannersResponse> {
    const banners = await this.bannerService.getAll();
    if (request.detailed) {
      return { banners: banners.map(b => ({ id: b.id, url: b.url })) };
    } else {
      return { banners: banners.map(b => b.url) };
    }
  }
}
