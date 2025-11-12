import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DecodeLocationUseCase } from '@/core/application/usecases/location/decode-location';

// Mock external dependencies
vi.mock('../../../infrastructure/db/mongo', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: vi.fn(),
        updateOne: vi.fn(),
        insertOne: vi.fn(),
      }),
    }),
  }),
}));

describe('DecodeLocationUseCase Integration Tests', () => {
  let useCase: DecodeLocationUseCase;
  let mockLocationService: any;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create mock service
    mockLocationService = {
      decodeLocation: vi.fn(),
    };

    // Create use case instance with mock service
    useCase = new DecodeLocationUseCase(mockLocationService);
  });

  describe('execute', () => {
    it('should decode location successfully', async () => {
      // Arrange
      const request = {
        token: 'test_location_token',
        accessToken: 'test_access_token',
      };

      const expectedResponse = {
        location: { lat: 21.0278, lng: 105.8342 },
        address: 'Hanoi, Vietnam',
      };

      mockLocationService.decodeLocation.mockResolvedValue(expectedResponse);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(mockLocationService.decodeLocation).toHaveBeenCalledWith(
        request.token,
        request.accessToken
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle gateway errors', async () => {
      // Arrange
      const request = {
        token: 'invalid_token',
        accessToken: 'test_access_token',
      };

      const gatewayError = new Error('Invalid token');
      mockLocationService.decodeLocation.mockRejectedValue(gatewayError);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Invalid token');
      expect(mockLocationService.decodeLocation).toHaveBeenCalledWith(
        request.token,
        request.accessToken
      );
    });

    it('should handle network errors', async () => {
      // Arrange
      const request = {
        token: 'test_token',
        accessToken: 'test_access_token',
      };

      const networkError = new Error('Network connection failed');
      mockLocationService.decodeLocation.mockRejectedValue(networkError);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Network connection failed');
      expect(mockLocationService.decodeLocation).toHaveBeenCalledWith(
        request.token,
        request.accessToken
      );
    });
  });
});
