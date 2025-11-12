import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ZaloLocationGateway } from '@/infrastructure/gateways/zalo-location-gateway';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ZaloLocationGateway', () => {
  let gateway: ZaloLocationGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new ZaloLocationGateway();

    // Set required environment variable
    process.env.ZALO_APP_SECRET = 'test_secret_key';
  });

  describe('decodeLocation', () => {
    it('should decode location successfully', async () => {
      // Arrange
      const mockZaloResponse = {
        data: {
          latitude: 21.0278,
          longitude: 105.8342
        }
      };

      const mockNominatimResponse = {
        display_name: 'Hanoi, Vietnam'
      };

      // Mock Zalo API
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify(mockZaloResponse)),
        } as Response)
      );

      // Mock Nominatim API
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockNominatimResponse),
        } as Response)
      );

      // Act
      const result = await gateway.decodeLocation('test_token', 'test_access_token');

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Check Zalo API call
      expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://graph.zalo.me/v2.0/me/info', {
        method: 'GET',
        headers: {
          access_token: 'test_access_token',
          code: 'test_token',
          secret_key: 'test_secret_key',
        },
      });

      // Check Nominatim API call
      expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://nominatim.openstreetmap.org/reverse?lat=21.0278&lon=105.8342&format=json', {
        method: 'GET',
        headers: {
          'User-Agent': 'haisanngaymoi-backend/1.0',
          Accept: 'application/json',
        },
      });

      expect(result).toEqual({
        location: { lat: 21.0278, lng: 105.8342 },
        address: 'Hanoi, Vietnam',
      });
    });

    it('should handle Zalo API error', async () => {
      // Arrange
      const mockErrorResponse = {
        error: 1,
        message: 'Invalid token'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(mockErrorResponse)),
      } as Response);

      // Act & Assert
      await expect(gateway.decodeLocation('invalid_token', 'test_access_token'))
        .rejects.toThrow('Invalid token');
    });

    it('should handle invalid JSON response', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('invalid json'),
      } as Response);

      // Act & Assert
      await expect(gateway.decodeLocation('test_token', 'test_access_token'))
        .rejects.toThrow('INVALID_JSON');
    });

    it('should handle missing coordinates', async () => {
      // Arrange
      const mockZaloResponse = {
        data: {
          // Missing latitude and longitude
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockZaloResponse)),
      } as Response);

      // Act & Assert
      await expect(gateway.decodeLocation('test_token', 'test_access_token'))
        .rejects.toThrow('Zalo Open API không trả về vị trí hợp lệ.');
    });

    it('should handle Nominatim API failure gracefully', async () => {
      // Arrange
      const mockZaloResponse = {
        data: {
          latitude: 21.0278,
          longitude: 105.8342
        }
      };

      // Mock Zalo API success
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify(mockZaloResponse)),
        } as Response)
      );

      // Mock Nominatim API failure
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server error'),
        } as Response)
      );

      // Act
      const result = await gateway.decodeLocation('test_token', 'test_access_token');

      // Assert
      expect(result).toEqual({
        location: { lat: 21.0278, lng: 105.8342 },
        address: null, // Should be null when geocoding fails
      });
    });

    it('should handle missing ZALO_APP_SECRET', async () => {
      // Arrange
      delete process.env.ZALO_APP_SECRET;

      // Act & Assert
      await expect(gateway.decodeLocation('test_token', 'test_access_token'))
        .rejects.toThrow('Server chưa được cấu hình ZALO_APP_SECRET.');
    });

    it('should handle network errors', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      // Act & Assert
      await expect(gateway.decodeLocation('test_token', 'test_access_token'))
        .rejects.toThrow('Network connection failed');
    });
  });
});
