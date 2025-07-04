import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { pdfGenerator } from '../../server/services/pdf-generator';
import { PDFDocument } from 'pdf-lib';

// Mock pdf-lib
jest.mock('pdf-lib');

const mockPDFDocument = {
  addPage: jest.fn().mockReturnValue({
    getSize: jest.fn().mockReturnValue({ width: 595.28, height: 841.89 }),
    drawText: jest.fn()
  }),
  embedFont: jest.fn(),
  save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
};

(PDFDocument.create as jest.Mock).mockResolvedValue(mockPDFDocument);

describe('PdfGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateInspectionReport', () => {
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
      inspectionData: {
        sections: [
          {
            name: 'Exterior Panels & Paint',
            items: [
              {
                id: 'ext-1',
                description: 'Panel gaps ≤ 5mm and equal on both sides',
                status: 'passed',
                notes: ''
              },
              {
                id: 'ext-2',
                description: 'Paint defects, stone marks, sand scratches or orange peel effect',
                status: 'failed',
                notes: 'Minor scratch on driver door'
              }
            ]
          }
        ]
      },
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      totalItems: 44,
      completedItems: 42,
      failedItems: 2,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z')
    };

    const mockMedia = [
      {
        id: 1,
        inspectionId: 1,
        itemId: 'ext-2',
        mediaType: 'photo',
        fileName: 'door_scratch.jpg',
        driveFileId: 'abc123',
        driveLink: 'https://drive.google.com/file/d/abc123/view',
        uploadStatus: 'uploaded',
        createdAt: new Date()
      }
    ];

    it('should generate PDF with inspection data', async () => {
      const result = await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      expect(PDFDocument.create).toHaveBeenCalled();
      expect(mockPDFDocument.addPage).toHaveBeenCalled();
      expect(mockPDFDocument.embedFont).toHaveBeenCalledTimes(2); // Regular and bold fonts
      expect(mockPDFDocument.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include vehicle information in PDF', async () => {
      await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      const page = mockPDFDocument.addPage();
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Tesla Pre-Delivery Inspection Report'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('RN123456'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('7SAYGDEF*NF123456'),
        expect.any(Object)
      );
    });

    it('should include inspection summary', async () => {
      await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      const page = mockPDFDocument.addPage();
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Total Items: 44'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Completed Items: 42'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Failed Items: 2'),
        expect.any(Object)
      );
    });

    it('should include section details and items', async () => {
      await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      const page = mockPDFDocument.addPage();
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Exterior Panels & Paint'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Panel gaps ≤ 5mm'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Minor scratch on driver door'),
        expect.any(Object)
      );
    });

    it('should include media links section', async () => {
      await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      const page = mockPDFDocument.addPage();
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Media Links'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('door_scratch.jpg'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('https://drive.google.com/file/d/abc123/view'),
        expect.any(Object)
      );
    });

    it('should include digital signature section when signature is present', async () => {
      await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      const page = mockPDFDocument.addPage();
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Digital Signature'),
        expect.any(Object)
      );
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Customer signature captured digitally'),
        expect.any(Object)
      );
    });

    it('should handle inspection without signature', async () => {
      const inspectionWithoutSignature = {
        ...mockInspection,
        signatureData: null
      };

      await pdfGenerator.generateInspectionReport(inspectionWithoutSignature, mockMedia);

      const page = mockPDFDocument.addPage();
      const drawTextCalls = page.drawText.mock.calls.map(call => call[0]);
      expect(drawTextCalls.some(text => text.includes('Digital Signature'))).toBe(false);
    });

    it('should handle inspection without media', async () => {
      await pdfGenerator.generateInspectionReport(mockInspection, []);

      const page = mockPDFDocument.addPage();
      const drawTextCalls = page.drawText.mock.calls.map(call => call[0]);
      expect(drawTextCalls.some(text => text.includes('Media Links'))).toBe(false);
    });

    it('should handle inspection without customer name', async () => {
      const inspectionWithoutCustomer = {
        ...mockInspection,
        customerName: null
      };

      await pdfGenerator.generateInspectionReport(inspectionWithoutCustomer, mockMedia);

      const page = mockPDFDocument.addPage();
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Customer: N/A'),
        expect.any(Object)
      );
    });

    it('should use different colors for passed/failed items', async () => {
      await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      const page = mockPDFDocument.addPage();
      const drawTextCalls = page.drawText.mock.calls;
      
      // Should have different color configurations for passed/failed items
      const coloredCalls = drawTextCalls.filter(call => call[1] && call[1].color);
      expect(coloredCalls.length).toBeGreaterThan(0);
    });

    it('should include footer with generation info', async () => {
      await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      const page = mockPDFDocument.addPage();
      expect(page.drawText).toHaveBeenCalledWith(
        expect.stringContaining('Generated by Tesla Delivery Companion'),
        expect.any(Object)
      );
    });

    it('should handle PDF generation errors', async () => {
      mockPDFDocument.save.mockRejectedValue(new Error('PDF generation failed'));

      await expect(
        pdfGenerator.generateInspectionReport(mockInspection, mockMedia)
      ).rejects.toThrow('PDF generation failed');
    });

    it('should return buffer with proper data', async () => {
      const mockPdfBytes = new Uint8Array([37, 80, 68, 70]); // PDF magic bytes
      mockPDFDocument.save.mockResolvedValue(mockPdfBytes);

      const result = await pdfGenerator.generateInspectionReport(mockInspection, mockMedia);

      expect(result).toBeInstanceOf(Buffer);
      expect(Array.from(result)).toEqual([37, 80, 68, 70]);
    });
  });
});