import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpsertUserUseCase } from '../upsert-user';
import { GetUserByIdUseCase } from '../get-user-by-id';
import type { UserService } from '@/core/application/interfaces/user-service';
import type { User } from '@/core/domain/user';

describe('User Use Cases', () => {
  let mockUserService: UserService;

  beforeEach(() => {
    mockUserService = {
      upsert: vi.fn(),
      getById: vi.fn(),
    };
  });

  describe('UpsertUserUseCase', () => {
    it('should create a new user when not exists', async () => {
      const mockUser: User = {
        id: 'zalo_user_123',
        zaloUserId: 'zalo_user_123',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        phone: '0123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockUserService.upsert).mockResolvedValue(mockUser);

      const useCase = new UpsertUserUseCase(mockUserService);
      const result = await useCase.execute({
        zaloUserId: 'zalo_user_123',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        phone: '0123456789',
      });

      expect(mockUserService.upsert).toHaveBeenCalledWith({
        zaloUserId: 'zalo_user_123',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        phone: '0123456789',
      });
      expect(result.user).toEqual(mockUser);
    });

    it('should update an existing user', async () => {
      const mockUser: User = {
        id: 'zalo_user_123',
        zaloUserId: 'zalo_user_123',
        name: 'John Doe Updated',
        avatar: 'https://example.com/new-avatar.jpg',
        phone: '0987654321',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
      };

      vi.mocked(mockUserService.upsert).mockResolvedValue(mockUser);

      const useCase = new UpsertUserUseCase(mockUserService);
      const result = await useCase.execute({
        zaloUserId: 'zalo_user_123',
        name: 'John Doe Updated',
        avatar: 'https://example.com/new-avatar.jpg',
        phone: '0987654321',
      });

      expect(result.user.name).toBe('John Doe Updated');
      expect(result.user.phone).toBe('0987654321');
    });

    it('should handle user without avatar and phone', async () => {
      const mockUser: User = {
        id: 'zalo_user_456',
        zaloUserId: 'zalo_user_456',
        name: 'Jane Smith',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockUserService.upsert).mockResolvedValue(mockUser);

      const useCase = new UpsertUserUseCase(mockUserService);
      const result = await useCase.execute({
        zaloUserId: 'zalo_user_456',
        name: 'Jane Smith',
      });

      expect(result.user.avatar).toBeUndefined();
      expect(result.user.phone).toBeUndefined();
    });
  });

  describe('GetUserByIdUseCase', () => {
    it('should return a user by zaloUserId', async () => {
      const mockUser: User = {
        id: 'zalo_user_123',
        zaloUserId: 'zalo_user_123',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        phone: '0123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockUserService.getById).mockResolvedValue(mockUser);

      const useCase = new GetUserByIdUseCase(mockUserService);
      const result = await useCase.execute({ id: 'zalo_user_123' });

      expect(mockUserService.getById).toHaveBeenCalledWith('zalo_user_123');
      expect(result.user).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      vi.mocked(mockUserService.getById).mockResolvedValue(null);

      const useCase = new GetUserByIdUseCase(mockUserService);
      const result = await useCase.execute({ id: 'non_existent_user' });

      expect(result.user).toBeNull();
    });

    it('should handle users with minimal data', async () => {
      const mockUser: User = {
        id: 'zalo_user_789',
        zaloUserId: 'zalo_user_789',
        name: 'Anonymous',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockUserService.getById).mockResolvedValue(mockUser);

      const useCase = new GetUserByIdUseCase(mockUserService);
      const result = await useCase.execute({ id: 'zalo_user_789' });

      expect(result.user?.name).toBe('Anonymous');
      expect(result.user?.avatar).toBeUndefined();
      expect(result.user?.phone).toBeUndefined();
    });
  });
});
