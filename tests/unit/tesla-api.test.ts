import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { teslaApiService } from '../../server/services/tesla-api';

// Mock fetch globally
global.fetch = jest.fn();

describe('TeslaApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.TESLA_API_KEY;
    delete process.env.TESLA_CLIENT_ID;
    delete process.env.TESLA_CLIENT_SECRET;
  });

  describe('getOrderStatus', () => {
    it('should return fallback data when no API key is configured', async () => {
      const result = await teslaApiService.getOrderStatus('RN123456');

      expect(result).toEqual({
        orderNumber: 'RN123456',
        customerEmail: 'customer@example.com',
        salesRepEmail: 'sales@tesla.com',
        vehicleVIN: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        customerName: 'Tesla Customer',
        deliveryDate: expect.any(String)
      });
    });

    it('should make API call when credentials are available', async () => {
      process.env.TESLA_CLIENT_ID = 'test-client-id';
      process.env.TESLA_CLIENT_SECRET = 'test-client-secret';

      // Mock token response
      const mockTokenResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 3600
        })
      };

      // Mock order data response
      const mockOrderResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          order_number: 'RN123456',
          customer_email: 'john@example.com',
          sales_rep_email: 'sales@tesla.com',
          vehicle_vin: '7SAYGDEF*NF123456',
          vehicle_model: 'Model Y Long Range',
          vehicle_color: 'Pearl White Multi-Coat',
          customer_name: 'John Doe',
          delivery_date: '2024-01-15'
        })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockOrderResponse);

      const result = await teslaApiService.getOrderStatus('RN123456');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        orderNumber: 'RN123456',
        customerEmail: 'john@example.com',
        salesRepEmail: 'sales@tesla.com',
        vehicleVIN: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        customerName: 'John Doe',
        deliveryDate: '2024-01-15'
      });
    });

    it('should handle API errors gracefully', async () => {
      process.env.TESLA_CLIENT_ID = 'test-client-id';
      process.env.TESLA_CLIENT_SECRET = 'test-client-secret';

      // Mock token response
      const mockTokenResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 3600
        })
      };

      // Mock failed order response
      const mockOrderResponse = {
        ok: false,
        status: 404
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockOrderResponse);

      const result = await teslaApiService.getOrderStatus('RN123456');

      // Should return fallback data on error
      expect(result).toEqual({
        orderNumber: 'RN123456',
        customerEmail: 'customer@example.com',
        salesRepEmail: 'sales@tesla.com',
        vehicleVIN: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        customerName: 'Tesla Customer',
        deliveryDate: expect.any(String)
      });
    });

    it('should handle OAuth token errors', async () => {
      process.env.TESLA_CLIENT_ID = 'test-client-id';
      process.env.TESLA_CLIENT_SECRET = 'test-client-secret';

      // Mock failed token response
      const mockTokenResponse = {
        ok: false,
        status: 401
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockTokenResponse);

      const result = await teslaApiService.getOrderStatus('RN123456');

      // Should return fallback data on OAuth error
      expect(result).toEqual({
        orderNumber: 'RN123456',
        customerEmail: 'customer@example.com',
        salesRepEmail: 'sales@tesla.com',
        vehicleVIN: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        customerName: 'Tesla Customer',
        deliveryDate: expect.any(String)
      });
    });

    it('should reuse valid access token', async () => {
      process.env.TESLA_CLIENT_ID = 'test-client-id';
      process.env.TESLA_CLIENT_SECRET = 'test-client-secret';

      // Mock token response
      const mockTokenResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 3600
        })
      };

      // Mock order data response
      const mockOrderResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          order_number: 'RN123456',
          customer_email: 'john@example.com',
          sales_rep_email: 'sales@tesla.com',
          vehicle_vin: '7SAYGDEF*NF123456',
          vehicle_model: 'Model Y Long Range',
          vehicle_color: 'Pearl White Multi-Coat',
          customer_name: 'John Doe',
          delivery_date: '2024-01-15'
        })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValue(mockOrderResponse);

      // First call - should get token
      await teslaApiService.getOrderStatus('RN123456');
      
      // Second call - should reuse token
      await teslaApiService.getOrderStatus('RN789012');

      // Should only call token endpoint once
      expect(global.fetch).toHaveBeenCalledTimes(3); // 1 token + 2 order calls
    });

    it('should handle network errors', async () => {
      process.env.TESLA_CLIENT_ID = 'test-client-id';
      process.env.TESLA_CLIENT_SECRET = 'test-client-secret';

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await teslaApiService.getOrderStatus('RN123456');

      // Should return fallback data on network error
      expect(result).toEqual({
        orderNumber: 'RN123456',
        customerEmail: 'customer@example.com',
        salesRepEmail: 'sales@tesla.com',
        vehicleVIN: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        customerName: 'Tesla Customer',
        deliveryDate: expect.any(String)
      });
    });
  });
});