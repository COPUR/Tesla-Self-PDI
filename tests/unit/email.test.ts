import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { emailService } from '../../server/services/email';
import { MailService } from '@sendgrid/mail';

// Mock SendGrid
jest.mock('@sendgrid/mail');

const mockMailService = {
  setApiKey: jest.fn(),
  send: jest.fn()
};

(MailService as jest.Mock).mockImplementation(() => mockMailService);

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SENDGRID_API_KEY = 'test-api-key';
    process.env.FROM_EMAIL = 'test@example.com';
  });

  describe('sendInspectionReport', () => {
    const mockInspection = {
      id: 1,
      orderNumber: 'RN123456',
      vin: '7SAYGDEF*NF123456',
      vehicleModel: 'Model Y Long Range',
      vehicleColor: 'Pearl White Multi-Coat',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      salesRepEmail: 'sales@tesla.com',
      status: 'completed',
      inspectionData: { sections: [] },
      signatureData: null,
      totalItems: 44,
      completedItems: 44,
      failedItems: 0,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z')
    };

    it('should send emails successfully when inspection passes', async () => {
      mockMailService.send.mockResolvedValue(true);

      const result = await emailService.sendInspectionReport(
        mockInspection,
        'https://drive.google.com/file/d/pdf123/view'
      );

      expect(result).toBe(true);
      expect(mockMailService.send).toHaveBeenCalledTimes(2); // Sales rep + customer
      
      // Check sales rep email
      const salesRepCall = mockMailService.send.mock.calls[0][0];
      expect(salesRepCall.to).toBe('sales@tesla.com');
      expect(salesRepCall.subject).toContain('RN123456');
      expect(salesRepCall.html).toContain('All inspection items have passed successfully');
    });

    it('should send warning emails when inspection has failures', async () => {
      const failedInspection = {
        ...mockInspection,
        completedItems: 42,
        failedItems: 2
      };

      mockMailService.send.mockResolvedValue(true);

      const result = await emailService.sendInspectionReport(
        failedInspection,
        'https://drive.google.com/file/d/pdf123/view'
      );

      expect(result).toBe(true);
      
      const salesRepCall = mockMailService.send.mock.calls[0][0];
      expect(salesRepCall.html).toContain('2 failed inspection item');
      expect(salesRepCall.html).toContain('⚠️ Attention Required');
    });

    it('should handle missing customer email', async () => {
      const inspectionWithoutCustomerEmail = {
        ...mockInspection,
        customerEmail: null
      };

      mockMailService.send.mockResolvedValue(true);

      const result = await emailService.sendInspectionReport(
        inspectionWithoutCustomerEmail,
        'https://drive.google.com/file/d/pdf123/view'
      );

      expect(result).toBe(true);
      expect(mockMailService.send).toHaveBeenCalledTimes(1); // Only sales rep
    });

    it('should send to support team when configured', async () => {
      process.env.SUPPORT_EMAIL = 'support@tesla.com';
      mockMailService.send.mockResolvedValue(true);

      const result = await emailService.sendInspectionReport(
        mockInspection,
        'https://drive.google.com/file/d/pdf123/view'
      );

      expect(result).toBe(true);
      expect(mockMailService.send).toHaveBeenCalledTimes(3); // Sales rep + customer + support
      
      const supportCall = mockMailService.send.mock.calls[2][0];
      expect(supportCall.to).toBe('support@tesla.com');
      expect(supportCall.subject).toContain('[TRACKING]');
    });

    it('should handle SendGrid errors gracefully', async () => {
      mockMailService.send.mockRejectedValue(new Error('SendGrid API error'));

      const result = await emailService.sendInspectionReport(
        mockInspection,
        'https://drive.google.com/file/d/pdf123/view'
      );

      expect(result).toBe(false);
    });

    it('should work without SendGrid API key (development mode)', async () => {
      delete process.env.SENDGRID_API_KEY;

      const result = await emailService.sendInspectionReport(
        mockInspection,
        'https://drive.google.com/file/d/pdf123/view'
      );

      expect(result).toBe(false);
      expect(mockMailService.send).not.toHaveBeenCalled();
    });

    it('should use fallback emails when missing', async () => {
      const inspectionWithMissingEmails = {
        ...mockInspection,
        customerEmail: null,
        salesRepEmail: null
      };

      mockMailService.send.mockResolvedValue(true);

      await emailService.sendInspectionReport(
        inspectionWithMissingEmails,
        'https://drive.google.com/file/d/pdf123/view'
      );

      const salesRepCall = mockMailService.send.mock.calls[0][0];
      expect(salesRepCall.to).toBe('sales@tesla.com'); // Fallback
    });
  });

  describe('sendNotificationEmail', () => {
    it('should send notification with high priority styling', async () => {
      mockMailService.send.mockResolvedValue(true);

      const result = await emailService.sendNotificationEmail(
        'admin@tesla.com',
        'System Alert',
        'Critical system issue detected',
        'high'
      );

      expect(result).toBe(true);
      expect(mockMailService.send).toHaveBeenCalledTimes(1);
      
      const notificationCall = mockMailService.send.mock.calls[0][0];
      expect(notificationCall.to).toBe('admin@tesla.com');
      expect(notificationCall.subject).toContain('[Tesla Delivery] System Alert');
      expect(notificationCall.html).toContain('priority-high');
    });

    it('should send notification with normal priority by default', async () => {
      mockMailService.send.mockResolvedValue(true);

      const result = await emailService.sendNotificationEmail(
        'admin@tesla.com',
        'System Update',
        'System updated successfully'
      );

      expect(result).toBe(true);
      
      const notificationCall = mockMailService.send.mock.calls[0][0];
      expect(notificationCall.html).toContain('priority-normal');
    });

    it('should handle notification email errors', async () => {
      mockMailService.send.mockRejectedValue(new Error('Network error'));

      const result = await emailService.sendNotificationEmail(
        'admin@tesla.com',
        'System Alert',
        'Critical system issue detected',
        'high'
      );

      expect(result).toBe(false);
    });

    it('should include timestamp in notification', async () => {
      mockMailService.send.mockResolvedValue(true);

      await emailService.sendNotificationEmail(
        'admin@tesla.com',
        'System Alert',
        'Test message'
      );

      const notificationCall = mockMailService.send.mock.calls[0][0];
      expect(notificationCall.html).toContain('Generated:');
      expect(notificationCall.text).toContain('Generated:');
    });
  });
});