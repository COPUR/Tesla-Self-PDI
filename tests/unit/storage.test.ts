import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DatabaseStorage } from '../../server/storage';
import { db } from '../../server/db';

// Mock the database
jest.mock('../../server/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

const mockDb = db as any;

describe('DatabaseStorage', () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    storage = new DatabaseStorage();
    jest.clearAllMocks();
  });

  describe('createInspection', () => {
    it('should create inspection successfully', async () => {
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

      const mockChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockInspection])
      };

      mockDb.insert.mockReturnValue(mockChain);

      const insertData = {
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

      const result = await storage.createInspection(insertData);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockChain.values).toHaveBeenCalledWith(insertData);
      expect(mockChain.returning).toHaveBeenCalled();
      expect(result).toEqual(mockInspection);
    });

    it('should handle database errors', async () => {
      const mockChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };

      mockDb.insert.mockReturnValue(mockChain);

      const insertData = {
        orderNumber: 'RN123456',
        vin: '7SAYGDEF*NF123456',
        vehicleModel: 'Model Y Long Range',
        vehicleColor: 'Pearl White Multi-Coat',
        inspectionData: { sections: [] },
        totalItems: 44,
        completedItems: 0,
        failedItems: 0
      };

      await expect(storage.createInspection(insertData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('getInspection', () => {
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

      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockInspection])
      };

      mockDb.select.mockReturnValue(mockChain);

      const result = await storage.getInspection(1);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(result).toEqual(mockInspection);
    });

    it('should return undefined when inspection not found', async () => {
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockChain);

      const result = await storage.getInspection(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getInspectionByOrderNumber', () => {
    it('should retrieve inspection by order number', async () => {
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

      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockInspection])
      };

      mockDb.select.mockReturnValue(mockChain);

      const result = await storage.getInspectionByOrderNumber('RN123456');

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(result).toEqual(mockInspection);
    });
  });

  describe('updateInspection', () => {
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

      const mockChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUpdatedInspection])
      };

      mockDb.update.mockReturnValue(mockChain);

      const updateData = {
        status: 'completed',
        completedItems: 44
      };

      const result = await storage.updateInspection(1, updateData);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockChain.set).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(mockChain.where).toHaveBeenCalled();
      expect(mockChain.returning).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedInspection);
    });
  });

  describe('deleteInspection', () => {
    it('should delete inspection successfully', async () => {
      const mockChain = {
        where: jest.fn().mockResolvedValue(undefined)
      };

      mockDb.delete.mockReturnValue(mockChain);

      await storage.deleteInspection(1);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
    });
  });

  describe('createInspectionMedia', () => {
    it('should create media record successfully', async () => {
      const mockMedia = {
        id: 1,
        inspectionId: 1,
        itemId: 'ext-1',
        mediaType: 'photo',
        fileName: 'panel_gap.jpg',
        driveFileId: 'abc123',
        driveLink: 'https://drive.google.com/file/d/abc123/view',
        uploadStatus: 'uploaded',
        createdAt: new Date()
      };

      const mockChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockMedia])
      };

      mockDb.insert.mockReturnValue(mockChain);

      const mediaData = {
        inspectionId: 1,
        itemId: 'ext-1',
        mediaType: 'photo',
        fileName: 'panel_gap.jpg',
        driveFileId: 'abc123',
        driveLink: 'https://drive.google.com/file/d/abc123/view',
        uploadStatus: 'uploaded'
      };

      const result = await storage.createInspectionMedia(mediaData);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockChain.values).toHaveBeenCalledWith(mediaData);
      expect(mockChain.returning).toHaveBeenCalled();
      expect(result).toEqual(mockMedia);
    });
  });

  describe('getInspectionMedia', () => {
    it('should retrieve media for inspection', async () => {
      const mockMedia = [
        {
          id: 1,
          inspectionId: 1,
          itemId: 'ext-1',
          mediaType: 'photo',
          fileName: 'panel_gap.jpg',
          driveFileId: 'abc123',
          driveLink: 'https://drive.google.com/file/d/abc123/view',
          uploadStatus: 'uploaded',
          createdAt: new Date()
        }
      ];

      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockMedia)
      };

      mockDb.select.mockReturnValue(mockChain);

      const result = await storage.getInspectionMedia(1);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(result).toEqual(mockMedia);
    });
  });

  describe('createInspectionReport', () => {
    it('should create report record successfully', async () => {
      const mockReport = {
        id: 1,
        inspectionId: 1,
        pdfFileName: 'Tesla_Inspection_RN123456.pdf',
        driveFileId: 'pdf123',
        driveLink: 'https://drive.google.com/file/d/pdf123/view',
        emailSent: false,
        createdAt: new Date()
      };

      const mockChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockReport])
      };

      mockDb.insert.mockReturnValue(mockChain);

      const reportData = {
        inspectionId: 1,
        pdfFileName: 'Tesla_Inspection_RN123456.pdf',
        driveFileId: 'pdf123',
        driveLink: 'https://drive.google.com/file/d/pdf123/view'
      };

      const result = await storage.createInspectionReport(reportData);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockChain.values).toHaveBeenCalledWith(reportData);
      expect(mockChain.returning).toHaveBeenCalled();
      expect(result).toEqual(mockReport);
    });
  });
});