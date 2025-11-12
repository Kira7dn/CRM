import type { BannerService } from "@/core/application/interfaces/banner-service";

export interface UpdateBannerRequest {
  id: number;
  url?: string;
}

export interface UpdateBannerResponse {
  banner: { id: number; url: string } | null;
}

export class UpdateBannerUseCase {
  constructor(private bannerService: BannerService) {}

  async execute(request: UpdateBannerRequest): Promise<UpdateBannerResponse> {
    const banner = await this.bannerService.update(request.id, { url: request.url });
    return { banner };
  }
}
