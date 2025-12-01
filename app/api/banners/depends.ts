import { BannerRepository } from '@/infrastructure/repositories/marketing/banner-repo';
import type { BannerService } from '@/core/application/interfaces/marketing/banner-service';
import { GetBannersUseCase } from '@/core/application/usecases/marketing/banner/get-banners';
import { CreateBannerUseCase } from '@/core/application/usecases/marketing/banner/create-banner';
import { GetBannerByIdUseCase } from '@/core/application/usecases/marketing/banner/get-banner-by-id';
import { UpdateBannerUseCase } from '@/core/application/usecases/marketing/banner/update-banner';
import { DeleteBannerUseCase } from '@/core/application/usecases/marketing/banner/delete-banner';

// Create BannerRepository instance
const createBannerRepository = async (): Promise<BannerService> => {
  return new BannerRepository();
};

// Create use case instances
export const getBannersUseCase = async () => {
  const bannerService = await createBannerRepository();
  return new GetBannersUseCase(bannerService);
};

export const createBannerUseCase = async () => {
  const bannerService = await createBannerRepository();
  return new CreateBannerUseCase(bannerService);
};

export const getBannerByIdUseCase = async () => {
  const bannerService = await createBannerRepository();
  return new GetBannerByIdUseCase(bannerService);
};

export const updateBannerUseCase = async () => {
  const bannerService = await createBannerRepository();
  return new UpdateBannerUseCase(bannerService);
};

export const deleteBannerUseCase = async () => {
  const bannerService = await createBannerRepository();
  return new DeleteBannerUseCase(bannerService);
};
