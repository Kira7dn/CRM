import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateBannerUseCase } from '../create-banner';
import { UpdateBannerUseCase } from '../update-banner';
import { GetBannerByIdUseCase } from '../get-banner-by-id';
import { GetBannersUseCase } from '../get-banners';
import { DeleteBannerUseCase } from '../delete-banner';
import type { BannerService } from '@/core/application/interfaces/banner-service';
import type { Banner } from '@/core/domain/banner';

describe('Banner Use Cases', () => {
  let mockBannerService: BannerService;

  beforeEach(() => {
    mockBannerService = {
      create: vi.fn(),
      update: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('CreateBannerUseCase', () => {
    it('should create a banner', async () => {
      const mockBanner: Banner = {
        id: 1,
        url: 'https://example.com/banner.jpg',
      };

      vi.mocked(mockBannerService.create).mockResolvedValue(mockBanner);

      const useCase = new CreateBannerUseCase(mockBannerService);
      const result = await useCase.execute({
        url: 'https://example.com/banner.jpg',
      });

      expect(mockBannerService.create).toHaveBeenCalled();
      expect(result.banner).toEqual(mockBanner);
      expect(result.banner.url).toBe('https://example.com/banner.jpg');
    });

    it('should create another banner', async () => {
      const mockBanner: Banner = {
        id: 2,
        url: 'https://example.com/banner2.jpg',
      };

      vi.mocked(mockBannerService.create).mockResolvedValue(mockBanner);

      const useCase = new CreateBannerUseCase(mockBannerService);
      const result = await useCase.execute({
        url: 'https://example.com/banner2.jpg',
      });

      expect(result.banner.url).toBe('https://example.com/banner2.jpg');
    });
  });

  describe('UpdateBannerUseCase', () => {
    it('should update an existing banner', async () => {
      const mockBanner: Banner = {
        id: 1,
        url: 'https://example.com/updated-banner.jpg',
      };

      vi.mocked(mockBannerService.update).mockResolvedValue(mockBanner);

      const useCase = new UpdateBannerUseCase(mockBannerService);
      const result = await useCase.execute({
        id: 1,
        url: 'https://example.com/updated-banner.jpg',
      });

      expect(mockBannerService.update).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result.banner).toEqual(mockBanner);
    });

    it('should return null when banner not found', async () => {
      vi.mocked(mockBannerService.update).mockResolvedValue(null);

      const useCase = new UpdateBannerUseCase(mockBannerService);
      const result = await useCase.execute({
        id: 999,
        url: 'https://example.com/banner.jpg',
      });

      expect(result.banner).toBeNull();
    });
  });

  describe('GetBannerByIdUseCase', () => {
    it('should return a banner by id', async () => {
      const mockBanner: Banner = {
        id: 1,
        url: 'https://example.com/banner.jpg',
      };

      vi.mocked(mockBannerService.getById).mockResolvedValue(mockBanner);

      const useCase = new GetBannerByIdUseCase(mockBannerService);
      const result = await useCase.execute({ id: 1 });

      expect(mockBannerService.getById).toHaveBeenCalledWith(1);
      expect(result.banner).toEqual(mockBanner);
    });

    it('should return null when banner not found', async () => {
      vi.mocked(mockBannerService.getById).mockResolvedValue(null);

      const useCase = new GetBannerByIdUseCase(mockBannerService);
      const result = await useCase.execute({ id: 999 });

      expect(result.banner).toBeNull();
    });
  });

  describe('GetBannersUseCase', () => {
    it('should return all banners in detailed mode', async () => {
      const mockBanners: Banner[] = [
        {
          id: 1,
          url: 'https://example.com/banner1.jpg',
        },
        {
          id: 2,
          url: 'https://example.com/banner2.jpg',
        },
      ];

      vi.mocked(mockBannerService.getAll).mockResolvedValue(mockBanners);

      const useCase = new GetBannersUseCase(mockBannerService);
      const result = await useCase.execute({ detailed: true });

      expect(mockBannerService.getAll).toHaveBeenCalled();
      expect(result.banners).toHaveLength(2);
      expect(result.banners[0]).toEqual({ id: 1, url: 'https://example.com/banner1.jpg' });
    });

    it('should return banner URLs only in non-detailed mode', async () => {
      const mockBanners: Banner[] = [
        {
          id: 1,
          url: 'https://example.com/banner1.jpg',
        },
        {
          id: 2,
          url: 'https://example.com/banner2.jpg',
        },
      ];

      vi.mocked(mockBannerService.getAll).mockResolvedValue(mockBanners);

      const useCase = new GetBannersUseCase(mockBannerService);
      const result = await useCase.execute({ detailed: false });

      expect(mockBannerService.getAll).toHaveBeenCalled();
      expect(result.banners).toHaveLength(2);
      expect(result.banners[0]).toBe('https://example.com/banner1.jpg');
      expect(result.banners[1]).toBe('https://example.com/banner2.jpg');
    });

    it('should return empty array when no banners exist', async () => {
      vi.mocked(mockBannerService.getAll).mockResolvedValue([]);

      const useCase = new GetBannersUseCase(mockBannerService);
      const result = await useCase.execute({ detailed: false });

      expect(result.banners).toEqual([]);
      expect(result.banners).toHaveLength(0);
    });
  });

  describe('DeleteBannerUseCase', () => {
    it('should delete a banner and return true', async () => {
      vi.mocked(mockBannerService.delete).mockResolvedValue(true);

      const useCase = new DeleteBannerUseCase(mockBannerService);
      const result = await useCase.execute({ id: 1 });

      expect(mockBannerService.delete).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should return false when banner not found', async () => {
      vi.mocked(mockBannerService.delete).mockResolvedValue(false);

      const useCase = new DeleteBannerUseCase(mockBannerService);
      const result = await useCase.execute({ id: 999 });

      expect(result.success).toBe(false);
    });
  });
});
