import { MailService } from '@sendgrid/mail';
import type { Inspection } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email size limits (conservative approach)
const MAX_EMAIL_SIZE = 20 * 1024 * 1024; // 20MB total
const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024; // 15MB per attachment

interface EmailParams {
  to: string | string[];
  cc?: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    content: string;
    filename: string;
    type: string;
    disposition?: string;
  }[];
}

interface InspectionEmailData {
  inspection: Inspection;
  pdfBuffer?: Buffer;
  pdfLink?: string;
  teslaRepName?: string;
  teslaRepEmail?: string;
  language?: string;
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log("Email would be sent:", { 
        to: params.to, 
        subject: params.subject,
        hasAttachments: !!params.attachments?.length 
      });
      return false;
    }

    // Handle multiple recipients
    const recipients = Array.isArray(params.to) ? params.to : [params.to];
    const ccRecipients = params.cc ? (Array.isArray(params.cc) ? params.cc : [params.cc]) : [];

    await mailService.send({
      to: recipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
      attachments: params.attachments,
    });
    
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Split large PDF into multiple parts if needed
function splitPdfBuffer(buffer: Buffer, maxSize: number): Buffer[] {
  if (buffer.length <= maxSize) {
    return [buffer];
  }

  const parts: Buffer[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    const end = Math.min(offset + maxSize, buffer.length);
    const part = buffer.slice(offset, end);
    parts.push(part);
    offset = end;
  }

  return parts;
}

class EnhancedEmailService {
  // Generate multilingual email content
  private getEmailContent(data: InspectionEmailData, isForCustomer: boolean = true) {
    const { inspection, teslaRepName, language = 'en' } = data;
    
    // Basic translations for common languages
    const translations: Record<string, any> = {
      en: {
        subject: `Tesla Delivery Inspection Report - Order ${inspection.orderNumber}`,
        greeting: `Dear ${inspection.customerName || 'Valued Customer'},`,
        intro: 'Your Tesla delivery inspection has been completed.',
        reportLink: 'View Inspection Report',
        vehicleInfo: 'Vehicle Information:',
        orderNumber: 'Order Number',
        totalItems: 'Total Items Inspected',
        failedItems: 'Items Failed',
        passedItems: 'Items Passed',
        onDeliveryStatus: 'On Delivery Phase',
        testDriveStatus: 'Test Drive Phase',
        questions: 'If you have any questions about this report, please contact your Tesla representative.',
        repInfo: teslaRepName ? `Your Tesla representative: ${teslaRepName}` : '',
        signature: 'Best regards,\nTesla Delivery Team'
      },
      zh: {
        subject: `特斯拉交付检查报告 - 订单 ${inspection.orderNumber}`,
        greeting: `尊敬的 ${inspection.customerName || '客户'},`,
        intro: '您的特斯拉交付检查已完成。',
        reportLink: '查看检查报告',
        vehicleInfo: '车辆信息：',
        orderNumber: '订单号',
        totalItems: '检查项目总数',
        failedItems: '失败项目',
        passedItems: '通过项目',
        onDeliveryStatus: '交付阶段',
        testDriveStatus: '试驾阶段',
        questions: '如有任何疑问，请联系您的特斯拉代表。',
        repInfo: teslaRepName ? `您的特斯拉代表：${teslaRepName}` : '',
        signature: '此致\n特斯拉交付团队'
      },
      de: {
        subject: `Tesla Auslieferungsprüfbericht - Bestellung ${inspection.orderNumber}`,
        greeting: `Liebe/r ${inspection.customerName || 'Kunde/Kundin'},`,
        intro: 'Ihre Tesla-Auslieferungsprüfung wurde abgeschlossen.',
        reportLink: 'Prüfbericht anzeigen',
        vehicleInfo: 'Fahrzeuginformationen:',
        orderNumber: 'Bestellnummer',
        totalItems: 'Geprüfte Artikel gesamt',
        failedItems: 'Fehlgeschlagene Artikel',
        passedItems: 'Bestandene Artikel',
        onDeliveryStatus: 'Auslieferungsphase',
        testDriveStatus: 'Probefahrtphase',
        questions: 'Bei Fragen zu diesem Bericht wenden Sie sich bitte an Ihren Tesla-Vertreter.',
        repInfo: teslaRepName ? `Ihr Tesla-Vertreter: ${teslaRepName}` : '',
        signature: 'Mit freundlichen Grüßen,\nTesla Auslieferungsteam'
      },
      fr: {
        subject: `Rapport d'Inspection de Livraison Tesla - Commande ${inspection.orderNumber}`,
        greeting: `Cher/Chère ${inspection.customerName || 'Client(e)'},`,
        intro: 'Votre inspection de livraison Tesla a été terminée.',
        reportLink: 'Voir le rapport d\'inspection',
        vehicleInfo: 'Informations sur le véhicule:',
        orderNumber: 'Numéro de commande',
        totalItems: 'Articles inspectés au total',
        failedItems: 'Articles échoués',
        passedItems: 'Articles réussis',
        onDeliveryStatus: 'Phase de livraison',
        testDriveStatus: 'Phase d\'essai routier',
        questions: 'Si vous avez des questions sur ce rapport, veuillez contacter votre représentant Tesla.',
        repInfo: teslaRepName ? `Votre représentant Tesla: ${teslaRepName}` : '',
        signature: 'Cordialement,\nÉquipe de Livraison Tesla'
      }
    };

    const t = translations[language] || translations.en;
    
    return {
      subject: isForCustomer ? t.subject : `[Tesla Internal] ${t.subject}`,
      text: this.generateTextContent(t, data),
      html: this.generateHtmlContent(t, data, isForCustomer)
    };
  }

  private generateTextContent(t: any, data: InspectionEmailData): string {
    const { inspection, pdfLink } = data;
    
    return `
${t.greeting}

${t.intro}

${pdfLink ? `${t.reportLink}: ${pdfLink}` : ''}

${t.vehicleInfo}
- ${t.orderNumber}: ${inspection.orderNumber}
- VIN: ${inspection.vin}
- ${t.totalItems}: ${inspection.totalItems}
- ${t.failedItems}: ${inspection.failedItems}
- ${t.passedItems}: ${inspection.totalItems - inspection.failedItems}
- ${t.onDeliveryStatus}: ${inspection.onDeliveryStatus || 'pending'}
- ${t.testDriveStatus}: ${inspection.testDriveStatus || 'pending'}

${t.repInfo}

${t.questions}

${t.signature}
    `.trim();
  }

  private generateHtmlContent(t: any, data: InspectionEmailData, isForCustomer: boolean): string {
    const { inspection, pdfLink } = data;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #e31937;">${t.subject.replace(/^\[Tesla Internal\] /, '')}</h2>
        
        <p>${t.greeting}</p>
        <p>${t.intro}</p>
        
        ${pdfLink ? `<p><a href="${pdfLink}" target="_blank" style="background-color: #e31937; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${t.reportLink}</a></p>` : ''}
        
        <h3>${t.vehicleInfo}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${t.orderNumber}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.orderNumber}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>VIN:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.vin}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Model:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.vehicleModel}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Color:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.vehicleColor}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${t.totalItems}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.totalItems}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${t.failedItems}:</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #e31937;">${inspection.failedItems}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${t.passedItems}:</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: #4CAF50;">${inspection.totalItems - inspection.failedItems}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${t.onDeliveryStatus}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.onDeliveryStatus || 'pending'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${t.testDriveStatus}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.testDriveStatus || 'pending'}</td></tr>
        </table>
        
        ${t.repInfo ? `<p><strong>${t.repInfo}</strong></p>` : ''}
        
        <p>${t.questions}</p>
        
        <p style="margin-top: 30px; font-style: italic;">${t.signature.replace('\n', '<br>')}</p>
        
        ${!isForCustomer ? '<p style="color: #666; font-size: 12px;"><em>This is an internal copy of the customer report.</em></p>' : ''}
      </div>
    `;
  }

  async sendInspectionReport(data: InspectionEmailData): Promise<boolean> {
    const { inspection, pdfBuffer, pdfLink, teslaRepEmail } = data;
    
    try {
      // Prepare recipients
      const customerEmail = inspection.customerEmail;
      const repEmail = teslaRepEmail || inspection.salesRepEmail;
      
      if (!customerEmail) {
        console.error('No customer email provided');
        return false;
      }

      // Generate email content
      const customerContent = this.getEmailContent(data, true);

      // Handle PDF attachment
      let attachments: any[] = [];
      let emailsSent = 0;
      let totalEmails = 0;

      if (pdfBuffer) {
        // Check if PDF needs splitting
        const pdfParts = splitPdfBuffer(pdfBuffer, MAX_ATTACHMENT_SIZE);
        
        if (pdfParts.length === 1) {
          // Single email with PDF attachment
          attachments = [{
            content: pdfBuffer.toString('base64'),
            filename: `Tesla_Inspection_${inspection.orderNumber}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          }];
        }

        // Send email(s) to customer
        if (pdfParts.length === 1) {
          // Single email
          const success = await sendEmail({
            to: customerEmail,
            cc: repEmail ? [repEmail] : undefined,
            from: 'noreply@tesla.com',
            subject: customerContent.subject,
            text: customerContent.text,
            html: customerContent.html,
            attachments
          });
          
          totalEmails = 1;
          if (success) emailsSent++;
        } else {
          // Multiple emails for large PDF
          for (let i = 0; i < pdfParts.length; i++) {
            const partAttachment = [{
              content: pdfParts[i].toString('base64'),
              filename: `Tesla_Inspection_${inspection.orderNumber}_part${i + 1}of${pdfParts.length}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment'
            }];

            const partSubject = `${customerContent.subject} - Part ${i + 1} of ${pdfParts.length}`;
            const partContent = i === 0 ? customerContent : {
              ...customerContent,
              subject: partSubject,
              text: `This is part ${i + 1} of ${pdfParts.length} of your inspection report.\n\n${customerContent.text}`,
              html: `<p><strong>This is part ${i + 1} of ${pdfParts.length} of your inspection report.</strong></p>${customerContent.html}`
            };

            const success = await sendEmail({
              to: customerEmail,
              cc: (repEmail && i === 0) ? [repEmail] : undefined, // CC rep only on first email
              from: 'noreply@tesla.com',
              subject: partContent.subject,
              text: partContent.text,
              html: partContent.html,
              attachments: partAttachment
            });
            
            totalEmails++;
            if (success) emailsSent++;
            
            // Brief delay between emails
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } else {
        // Email without PDF attachment (link only)
        const success = await sendEmail({
          to: customerEmail,
          cc: repEmail ? [repEmail] : undefined,
          from: 'noreply@tesla.com',
          subject: customerContent.subject,
          text: customerContent.text,
          html: customerContent.html
        });
        
        totalEmails = 1;
        if (success) emailsSent++;
      }

      // Log results
      console.log(`Email delivery: ${emailsSent}/${totalEmails} emails sent successfully`);
      return emailsSent === totalEmails;
      
    } catch (error) {
      console.error('Error sending inspection report emails:', error);
      return false;
    }
  }

  async sendNotificationEmail(
    to: string | string[],
    subject: string,
    message: string,
    inspection?: Inspection,
    cc?: string | string[]
  ): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #e31937;">${subject}</h2>
        <p>${message}</p>
        ${inspection ? `
          <h3>Inspection Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Order Number:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.orderNumber}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>VIN:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.vin}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inspection.status}</td></tr>
          </table>
        ` : ''}
        <p style="margin-top: 30px; font-style: italic;">Best regards,<br>Tesla Delivery Team</p>
      </div>
    `;

    return sendEmail({
      to,
      cc,
      from: 'noreply@tesla.com',
      subject,
      text: message,
      html: htmlContent,
    });
  }

  async sendPhaseCompletionNotification(
    inspection: Inspection,
    phase: 'onDelivery' | 'testDrive',
    teslaRepEmail?: string,
    language = 'en'
  ): Promise<boolean> {
    const phaseNames = {
      en: { onDelivery: 'On Delivery', testDrive: 'Test Drive' },
      zh: { onDelivery: '交付检查', testDrive: '试驾检查' },
      de: { onDelivery: 'Auslieferung', testDrive: 'Probefahrt' },
      fr: { onDelivery: 'Livraison', testDrive: 'Essai Routier' }
    };
    
    const phaseName = phaseNames[language as keyof typeof phaseNames]?.[phase] || phaseNames.en[phase];
    const subject = `Tesla ${phaseName} Phase Completed - Order ${inspection.orderNumber}`;
    const message = `The ${phaseName} inspection phase has been completed for order ${inspection.orderNumber}.`;

    const recipients = [inspection.customerEmail];
    if (teslaRepEmail) recipients.push(teslaRepEmail);

    return this.sendNotificationEmail(
      recipients.filter(Boolean),
      subject,
      message,
      inspection
    );
  }

  // Legacy method for backward compatibility
  async sendInspectionReportLegacy(inspection: Inspection, pdfLink: string): Promise<boolean> {
    return this.sendInspectionReport({
      inspection,
      pdfLink,
      language: 'en'
    });
  }
}

export const enhancedEmailService = new EnhancedEmailService();

// Export both for compatibility
export const emailService = enhancedEmailService;