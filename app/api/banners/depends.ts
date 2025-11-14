import { BannerRepository } from '@/infrastructure/repositories/banner-repo';
import type { BannerService } from '@/core/application/interfaces/banner-service';
import { GetBannersUseCase } from '@/core/application/usecases/banner/get-banners';
import { CreateBannerUseCase } from '@/core/application/usecases/banner/create-banner';
import { GetBannerByIdUseCase } from '@/core/application/usecases/banner/get-banner-by-id';
import { UpdateBannerUseCase } from '@/core/application/usecases/banner/update-banner';
import { DeleteBannerUseCase } from '@/core/application/usecases/banner/delete-banner';

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
