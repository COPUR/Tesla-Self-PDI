import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Inspection, InspectionMedia } from '@shared/schema';

class PdfGenerator {
  async generateInspectionReport(
    inspection: Inspection,
    media: InspectionMedia[]
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Header
    page.drawText('Tesla Pre-Delivery Inspection Report', {
      x: 50,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 40;

    // Vehicle Information
    page.drawText(`Order Number: ${inspection.orderNumber}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;
    page.drawText(`VIN: ${inspection.vin}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;
    page.drawText(`Vehicle: ${inspection.vehicleModel}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;
    page.drawText(`Color: ${inspection.vehicleColor}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;
    page.drawText(`Customer: ${inspection.customerName || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;
    page.drawText(`Inspection Date: ${new Date(inspection.createdAt).toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 40;

    // Inspection Summary
    page.drawText('Inspection Summary', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
    });

    yPosition -= 25;
    page.drawText(`Total Items: ${inspection.totalItems}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;
    page.drawText(`Completed Items: ${inspection.completedItems}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;
    page.drawText(`Failed Items: ${inspection.failedItems}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: inspection.failedItems > 0 ? rgb(0.8, 0.1, 0.1) : rgb(0, 0, 0),
    });

    yPosition -= 40;

    // Inspection Details
    page.drawText('Inspection Details', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
    });

    yPosition -= 25;

    const inspectionData = inspection.inspectionData as any;
    if (inspectionData && inspectionData.sections) {
      for (const section of inspectionData.sections) {
        if (yPosition < 100) {
          // Add new page if needed
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }

        page.drawText(section.name, {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
        });

        yPosition -= 20;

        for (const item of section.items) {
          if (yPosition < 80) {
            break; // Prevent overflow
          }

          const status = item.status === 'passed' ? '✓' : item.status === 'failed' ? '✗' : '○';
          const statusColor = item.status === 'passed' ? rgb(0, 0.7, 0) : 
                            item.status === 'failed' ? rgb(0.8, 0.1, 0.1) : rgb(0.5, 0.5, 0.5);

          page.drawText(`${status} ${item.description}`, {
            x: 60,
            y: yPosition,
            size: 10,
            font: font,
            color: statusColor,
          });

          if (item.notes) {
            yPosition -= 15;
            page.drawText(`   Notes: ${item.notes}`, {
              x: 60,
              y: yPosition,
              size: 9,
              font: font,
              color: rgb(0.4, 0.4, 0.4),
            });
          }

          yPosition -= 15;
        }

        yPosition -= 10;
      }
    }

    // Media Links
    if (media.length > 0) {
      yPosition -= 20;
      page.drawText('Media Links', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
      });

      yPosition -= 25;

      for (const mediaItem of media) {
        if (yPosition < 60) break;

        page.drawText(`${mediaItem.fileName}: ${mediaItem.driveLink}`, {
          x: 50,
          y: yPosition,
          size: 9,
          font: font,
          color: rgb(0, 0, 0.8),
        });

        yPosition -= 15;
      }
    }

    // Signature
    if (inspection.signatureData) {
      yPosition -= 40;
      page.drawText('Digital Signature', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
      });

      yPosition -= 20;
      page.drawText('Customer signature captured digitally', {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
      });
    }

    // Footer
    page.drawText('Generated by Tesla Delivery Companion', {
      x: 50,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export const pdfGenerator = new PdfGenerator();
