import type { BannerService } from "@/core/application/interfaces/banner-service";

export interface GetBannerByIdRequest {
  id: number;
}

export interface GetBannerByIdResponse {
  banner: { id: number; url: string } | null;
}

export class GetBannerByIdUseCase {
  constructor(private bannerService: BannerService) {}

  async execute(request: GetBannerByIdRequest): Promise<GetBannerByIdResponse> {
    const banner = await this.bannerService.getById(request.id);
    return { banner };
  }
}
