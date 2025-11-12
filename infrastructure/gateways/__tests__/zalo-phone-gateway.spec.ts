import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ZaloPhoneGateway } from '@/infrastructure/gateways/zalo-phone-gateway';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ZaloPhoneGateway', () => {
  let gateway: ZaloPhoneGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new ZaloPhoneGateway();

    // Set required environment variable
    process.env.ZALO_APP_SECRET = 'test_secret_key';
  });

  describe('decodePhone', () => {
    it('should decode phone successfully', async () => {
      // Arrange
      const mockZaloResponse = {
        data: {
          number: '+84987654321'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockZaloResponse)),
      } as Response);

      // Act
      const result = await gateway.decodePhone('test_token', 'test_access_token');

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('https://graph.zalo.me/v2.0/me/info', {
        method: 'GET',
        headers: {
          access_token: 'test_access_token',
          code: 'test_token',
          secret_key: 'test_secret_key',
        },
      });
      expect(result).toBe('+84987654321');
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
      await expect(gateway.decodePhone('invalid_token', 'test_access_token'))
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
      await expect(gateway.decodePhone('test_token', 'test_access_token'))
        .rejects.toThrow('INVALID_JSON');
    });

    it('should handle missing phone number', async () => {
      // Arrange
      const mockZaloResponse = {
        data: {
          // Missing number field
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockZaloResponse)),
      } as Response);

      // Act & Assert
      await expect(gateway.decodePhone('test_token', 'test_access_token'))
        .rejects.toThrow('Zalo Open API không trả về số điện thoại hợp lệ.');
    });

    it('should handle missing ZALO_APP_SECRET', async () => {
      // Arrange
      delete process.env.ZALO_APP_SECRET;

      // Act & Assert
      await expect(gateway.decodePhone('test_token', 'test_access_token'))
        .rejects.toThrow('Server chưa được cấu hình ZALO_APP_SECRET.');
    });

    it('should handle network errors', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      // Act & Assert
      await expect(gateway.decodePhone('test_token', 'test_access_token'))
        .rejects.toThrow('Network connection failed');
    });
  });
});
