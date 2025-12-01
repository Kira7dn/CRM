import type { BannerService } from "@/core/application/interfaces/marketing/banner-service";

export interface DeleteBannerRequest {
  id: number;
}

export interface DeleteBannerResponse {
  success: boolean;
}

export class DeleteBannerUseCase {
  constructor(private bannerService: BannerService) {}

  async execute(request: DeleteBannerRequest): Promise<DeleteBannerResponse> {
    const success = await this.bannerService.delete(request.id);
    return { success };
  }
}
