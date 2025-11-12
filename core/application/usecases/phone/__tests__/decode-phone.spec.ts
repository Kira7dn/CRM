import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DecodePhoneUseCase } from '@/core/application/usecases/phone/decode-phone';

// Mock the phone service
const mockPhoneService = {
  decodePhone: vi.fn(),
};

const mockPhoneServiceClass = vi.fn().mockImplementation(() => mockPhoneService);

vi.mock('@/core/application/interfaces/phone-service', () => ({
  PhoneService: mockPhoneServiceClass,
}));

describe('DecodePhoneUseCase', () => {
  let useCase: DecodePhoneUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DecodePhoneUseCase(mockPhoneService);
  });

  describe('execute', () => {
    it('should call phoneService.decodePhone with correct parameters', async () => {
      // Arrange
      const request = {
        token: 'test_phone_token',
        accessToken: 'test_access_token',
      };

      const expectedPhone = '+84987654321';
      mockPhoneService.decodePhone.mockResolvedValue(expectedPhone);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(mockPhoneService.decodePhone).toHaveBeenCalledWith(
        request.token,
        request.accessToken
      );
      expect(mockPhoneService.decodePhone).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ phone: expectedPhone });
    });

    it('should propagate errors from phoneService', async () => {
      // Arrange
      const request = {
        token: 'invalid_token',
        accessToken: 'test_access_token',
      };

      const serviceError = new Error('Service unavailable');
      mockPhoneService.decodePhone.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Service unavailable');
      expect(mockPhoneService.decodePhone).toHaveBeenCalledWith(
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

      const expectedPhone = '+84123456789';
      mockPhoneService.decodePhone.mockResolvedValue(expectedPhone);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(mockPhoneService.decodePhone).toHaveBeenCalledWith(
        'different_token',
        'different_access_token'
      );
      expect(result).toEqual({ phone: expectedPhone });
    });
  });
});
