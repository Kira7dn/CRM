import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DecodeLocationUseCase } from '@/core/application/usecases/location/decode-location';

// Mock the location service
const mockLocationService = {
  decodeLocation: vi.fn(),
};

const mockLocationServiceClass = vi.fn().mockImplementation(() => mockLocationService);

vi.mock('@/core/application/interfaces/location-service', () => ({
  LocationService: mockLocationServiceClass,
}));

describe('DecodeLocationUseCase', () => {
  let useCase: DecodeLocationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DecodeLocationUseCase(mockLocationService);
  });

  describe('execute', () => {
    it('should call locationService.decodeLocation with correct parameters', async () => {
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
      expect(mockLocationService.decodeLocation).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate errors from locationService', async () => {
      // Arrange
      const request = {
        token: 'invalid_token',
        accessToken: 'test_access_token',
      };

      const serviceError = new Error('Service unavailable');
      mockLocationService.decodeLocation.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Service unavailable');
      expect(mockLocationService.decodeLocation).toHaveBeenCalledWith(
        request.token,
        request.accessToken
      );
    });

    it('should handle different token and accessToken combinations', async () => {
      // Arrange
      const request = {
        token: 'different_token',
        accessToken: 'different_access_token',
      };

      const expectedResponse = {
        location: { lat: 10.8231, lng: 106.6297 },
        address: 'Ho Chi Minh City, Vietnam',
      };

      mockLocationService.decodeLocation.mockResolvedValue(expectedResponse);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(mockLocationService.decodeLocation).toHaveBeenCalledWith(
        'different_token',
        'different_access_token'
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
