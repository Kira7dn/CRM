import type { BannerService } from "@/core/application/interfaces/banner-service";

export interface CreateBannerRequest {
  id?: number;
  url: string;
}

export interface CreateBannerResponse {
  banner: { id: number; url: string };
}

export class CreateBannerUseCase {
  constructor(private bannerService: BannerService) {}

  async execute(request: CreateBannerRequest): Promise<CreateBannerResponse> {
    const banner = await this.bannerService.create({ url: request.url });
    return { banner };
  }
}
