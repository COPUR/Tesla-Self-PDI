import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';
import { storage } from '../../server/storage';

// Mock all external dependencies
jest.mock('../../server/storage');
jest.mock('../../server/services/tesla-api');
jest.mock('../../server/services/google-drive');
jest.mock('../../server/services/pdf-generator');
jest.mock('../../server/services/email');

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('API Routes Integration Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    server = await registerRoutes(app);
  });

  afterAll(() => {
    if (server && server.close) {
      server.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/inspections', () => {
    it('should create a new inspection', async () => {
      const mockInspection = {
        id: 1,
        orderNumber: 'RN123456',
        vin: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        salesRepEmail: 'sales@tesla.com',
        status: 'draft',
        inspectionData: { sections: [] },
        signatureData: null,
        totalItems: 44,
        completedItems: 0,
        failedItems: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockStorage.createInspection.mockResolvedValue(mockInspection);

      const inspectionData = {
        orderNumber: 'RN123456',
        vin: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        salesRepEmail: 'sales@tesla.com',
        status: 'draft',
        inspectionData: { sections: [] },
        totalItems: 44,
        completedItems: 0,
        failedItems: 0
      };

      const response = await request(app)
        .post('/api/inspections')
        .send(inspectionData)
        .expect(200);

      expect(response.body).toEqual(mockInspection);
      expect(mockStorage.createInspection).toHaveBeenCalledWith(inspectionData);
    });

    it('should return 400 for invalid inspection data', async () => {
      const invalidData = {
        orderNumber: '', // Invalid: empty order number
        vin: '7SAYGDEF*NF123456'
      };

      const response = await request(app)
        .post('/api/inspections')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid inspection data' });
      expect(mockStorage.createInspection).not.toHaveBeenCalled();
    });

    it('should handle storage errors', async () => {
      mockStorage.createInspection.mockRejectedValue(new Error('Database error'));

      const validData = {
        orderNumber: 'RN123456',
        vin: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        inspectionData: { sections: [] },
        totalItems: 44,
        completedItems: 0,
        failedItems: 0
      };

      const response = await request(app)
        .post('/api/inspections')
        .send(validData)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid inspection data' });
    });
  });

  describe('GET /api/inspections/:id', () => {
    it('should retrieve inspection by ID', async () => {
      const mockInspection = {
        id: 1,
        orderNumber: 'RN123456',
        vin: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        status: 'draft',
        inspectionData: { sections: [] },
        totalItems: 44,
        completedItems: 0,
        failedItems: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockStorage.getInspection.mockResolvedValue(mockInspection);

      const response = await request(app)
        .get('/api/inspections/1')
        .expect(200);

      expect(response.body).toEqual(mockInspection);
      expect(mockStorage.getInspection).toHaveBeenCalledWith(1);
    });

    it('should return 404 when inspection not found', async () => {
      mockStorage.getInspection.mockResolvedValue(undefined);

      const response = await request(app)
        .get('/api/inspections/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Inspection not found' });
    });

    it('should handle invalid ID format', async () => {
      const response = await request(app)
        .get('/api/inspections/invalid')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch inspection' });
    });
  });

  describe('PUT /api/inspections/:id', () => {
    it('should update inspection successfully', async () => {
      const mockUpdatedInspection = {
        id: 1,
        orderNumber: 'RN123456',
        vin: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        status: 'completed',
        inspectionData: { sections: [] },
        totalItems: 44,
        completedItems: 44,
        failedItems: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockStorage.updateInspection.mockResolvedValue(mockUpdatedInspection);

      const updateData = {
        status: 'completed',
        completedItems: 44
      };

      const response = await request(app)
        .put('/api/inspections/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdatedInspection);
      expect(mockStorage.updateInspection).toHaveBeenCalledWith(1, updateData);
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        orderNumber: '' // Invalid: empty order number
      };

      const response = await request(app)
        .put('/api/inspections/1')
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid inspection data' });
    });
  });

  describe('GET /api/tesla/order/:orderNumber', () => {
    it('should retrieve Tesla order data', async () => {
      // Mock the Tesla API service
      const { teslaApiService } = require('../../server/services/tesla-api');
      const mockOrderData = {
        orderNumber: 'RN123456',
        customerEmail: 'john@example.com',
        salesRepEmail: 'sales@tesla.com',
        vehicleVIN: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        customerName: 'John Doe',
        deliveryDate: '2024-01-15'
      };

      teslaApiService.getOrderStatus.mockResolvedValue(mockOrderData);

      const response = await request(app)
        .get('/api/tesla/order/RN123456')
        .expect(200);

      expect(response.body).toEqual(mockOrderData);
      expect(teslaApiService.getOrderStatus).toHaveBeenCalledWith('RN123456');
    });

    it('should handle Tesla API errors', async () => {
      const { teslaApiService } = require('../../server/services/tesla-api');
      teslaApiService.getOrderStatus.mockRejectedValue(new Error('Tesla API error'));

      const response = await request(app)
        .get('/api/tesla/order/RN123456')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch order status' });
    });
  });

  describe('POST /api/inspections/:id/media', () => {
    it('should upload media successfully', async () => {
      const mockInspection = { id: 1, orderNumber: 'RN123456' };
      const mockUploadResult = {
        id: 'file123',
        webViewLink: 'https://drive.google.com/file/d/file123/view',
        webContentLink: 'https://drive.google.com/uc?id=file123'
      };
      const mockMediaRecord = {
        id: 1,
        inspectionId: 1,
        itemId: 'ext-1',
        mediaType: 'photo',
        fileName: 'test-image.jpg',
        driveFileId: 'file123',
        driveLink: 'https://drive.google.com/file/d/file123/view',
        uploadStatus: 'uploaded',
        createdAt: new Date()
      };

      const { googleDriveService } = require('../../server/services/google-drive');
      googleDriveService.uploadFile.mockResolvedValue(mockUploadResult);
      mockStorage.createInspectionMedia.mockResolvedValue(mockMediaRecord);

      const response = await request(app)
        .post('/api/inspections/1/media')
        .attach('media', Buffer.from('fake image data'), 'test-image.jpg')
        .field('itemId', 'ext-1')
        .field('mediaType', 'photo')
        .expect(200);

      expect(response.body).toEqual(mockMediaRecord);
      expect(googleDriveService.uploadFile).toHaveBeenCalled();
      expect(mockStorage.createInspectionMedia).toHaveBeenCalledWith({
        inspectionId: 1,
        itemId: 'ext-1',
        mediaType: 'photo',
        fileName: 'test-image.jpg',
        driveFileId: 'file123',
        driveLink: 'https://drive.google.com/file/d/file123/view',
        uploadStatus: 'uploaded'
      });
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/inspections/1/media')
        .field('itemId', 'ext-1')
        .field('mediaType', 'photo')
        .expect(400);

      expect(response.body).toEqual({ error: 'No file uploaded' });
    });

    it('should handle Google Drive upload errors', async () => {
      const { googleDriveService } = require('../../server/services/google-drive');
      googleDriveService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      const response = await request(app)
        .post('/api/inspections/1/media')
        .attach('media', Buffer.from('fake image data'), 'test-image.jpg')
        .field('itemId', 'ext-1')
        .field('mediaType', 'photo')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to upload media' });
    });
  });

  describe('GET /api/inspections/:id/media', () => {
    it('should retrieve media for inspection', async () => {
      const mockMedia = [
        {
          id: 1,
          inspectionId: 1,
          itemId: 'ext-1',
          mediaType: 'photo',
          fileName: 'test-image.jpg',
          driveFileId: 'file123',
          driveLink: 'https://drive.google.com/file/d/file123/view',
          uploadStatus: 'uploaded',
          createdAt: new Date()
        }
      ];

      mockStorage.getInspectionMedia.mockResolvedValue(mockMedia);

      const response = await request(app)
        .get('/api/inspections/1/media')
        .expect(200);

      expect(response.body).toEqual(mockMedia);
      expect(mockStorage.getInspectionMedia).toHaveBeenCalledWith(1);
    });

    it('should handle errors when fetching media', async () => {
      mockStorage.getInspectionMedia.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/inspections/1/media')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch media' });
    });
  });

  describe('POST /api/inspections/:id/complete', () => {
    it('should complete inspection successfully', async () => {
      const mockInspection = {
        id: 1,
        orderNumber: 'RN123456',
        vin: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        status: 'draft',
        inspectionData: { sections: [] },
        totalItems: 44,
        completedItems: 44,
        failedItems: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockMedia = [];
      const mockPdfBuffer = Buffer.from('PDF content');
      const mockDriveResult = {
        id: 'pdf123',
        webViewLink: 'https://drive.google.com/file/d/pdf123/view',
        webContentLink: 'https://drive.google.com/uc?id=pdf123'
      };
      const mockReport = {
        id: 1,
        inspectionId: 1,
        pdfFileName: 'Tesla_Inspection_RN123456.pdf',
        driveFileId: 'pdf123',
        driveLink: 'https://drive.google.com/file/d/pdf123/view',
        emailSent: false,
        createdAt: new Date()
      };

      mockStorage.getInspection.mockResolvedValue(mockInspection);
      mockStorage.getInspectionMedia.mockResolvedValue(mockMedia);
      mockStorage.createInspectionReport.mockResolvedValue(mockReport);
      mockStorage.updateInspectionReport.mockResolvedValue({...mockReport, emailSent: true});
      mockStorage.updateInspection.mockResolvedValue({...mockInspection, status: 'completed'});

      const { pdfGenerator } = require('../../server/services/pdf-generator');
      const { googleDriveService } = require('../../server/services/google-drive');
      const { emailService } = require('../../server/services/email');

      pdfGenerator.generateInspectionReport.mockResolvedValue(mockPdfBuffer);
      googleDriveService.uploadFile.mockResolvedValue(mockDriveResult);
      emailService.sendInspectionReport.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/inspections/1/complete')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        reportId: 1,
        pdfLink: 'https://drive.google.com/file/d/pdf123/view',
        emailSent: true
      });

      expect(mockStorage.getInspection).toHaveBeenCalledWith(1);
      expect(mockStorage.getInspectionMedia).toHaveBeenCalledWith(1);
      expect(pdfGenerator.generateInspectionReport).toHaveBeenCalledWith(mockInspection, mockMedia);
      expect(googleDriveService.uploadFile).toHaveBeenCalledWith(
        mockPdfBuffer,
        'Tesla_Inspection_RN123456.pdf',
        'application/pdf'
      );
      expect(emailService.sendInspectionReport).toHaveBeenCalledWith(
        mockInspection,
        'https://drive.google.com/file/d/pdf123/view'
      );
      expect(mockStorage.updateInspection).toHaveBeenCalledWith(1, { status: 'completed' });
    });

    it('should return 404 when inspection not found', async () => {
      mockStorage.getInspection.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/inspections/999/complete')
        .expect(404);

      expect(response.body).toEqual({ error: 'Inspection not found' });
    });

    it('should handle PDF generation errors', async () => {
      const mockInspection = { id: 1, orderNumber: 'RN123456' };
      mockStorage.getInspection.mockResolvedValue(mockInspection);
      mockStorage.getInspectionMedia.mockResolvedValue([]);

      const { pdfGenerator } = require('../../server/services/pdf-generator');
      pdfGenerator.generateInspectionReport.mockRejectedValue(new Error('PDF generation failed'));

      const response = await request(app)
        .post('/api/inspections/1/complete')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to complete inspection' });
    });
  });
});