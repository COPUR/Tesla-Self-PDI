import { MailService } from '@sendgrid/mail';
import type { Inspection } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    content: string;
    filename: string;
    type: string;
  }[];
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log("Email would be sent:", params);
      return false;
    }

    await mailService.send({
      to: params.to,
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

class EmailService {
  async sendInspectionReport(inspection: Inspection, pdfLink: string): Promise<boolean> {
    try {
      const fromEmail = process.env.FROM_EMAIL || 'noreply@tesla-delivery-companion.com';
      const salesRepEmail = inspection.salesRepEmail || 'sales@tesla.com';
      const customerEmail = inspection.customerEmail || '';
      
      const subject = `Tesla Pre-Delivery Inspection Report - Order ${inspection.orderNumber}`;
      
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background: #000; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .vehicle-info { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 8px; }
              .summary { display: flex; justify-content: space-between; margin: 20px 0; }
              .summary-item { text-align: center; }
              .failed { color: #dc3545; font-weight: bold; }
              .passed { color: #28a745; font-weight: bold; }
              .button { 
                background: #dc3545; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block;
                margin: 10px 0;
              }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Tesla Pre-Delivery Inspection Report</h1>
              <p>Professional Vehicle Inspection Completed</p>
            </div>
            
            <div class="content">
              <h2>Inspection Details</h2>
              
              <div class="vehicle-info">
                <h3>Vehicle Information</h3>
                <p><strong>Order Number:</strong> ${inspection.orderNumber}</p>
                <p><strong>VIN:</strong> ${inspection.vin}</p>
                <p><strong>Model:</strong> ${inspection.vehicleModel}</p>
                <p><strong>Color:</strong> ${inspection.vehicleColor}</p>
                <p><strong>Customer:</strong> ${inspection.customerName || 'N/A'}</p>
                <p><strong>Inspection Date:</strong> ${new Date(inspection.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div class="summary">
                <div class="summary-item">
                  <h4>Total Items</h4>
                  <p style="font-size: 24px; font-weight: bold;">${inspection.totalItems}</p>
                </div>
                <div class="summary-item">
                  <h4>Completed</h4>
                  <p style="font-size: 24px; font-weight: bold;" class="passed">${inspection.completedItems}</p>
                </div>
                <div class="summary-item">
                  <h4>Failed Items</h4>
                  <p style="font-size: 24px; font-weight: bold;" class="failed">${inspection.failedItems}</p>
                </div>
              </div>
              
              ${inspection.failedItems > 0 ? `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 8px;">
                  <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ Attention Required</h4>
                  <p style="color: #856404; margin: 0;">
                    This vehicle has ${inspection.failedItems} failed inspection item${inspection.failedItems > 1 ? 's' : ''} that require attention before delivery.
                    Please review the detailed report and coordinate with the service team for resolution.
                  </p>
                </div>
              ` : `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 8px;">
                  <h4 style="color: #155724; margin: 0 0 10px 0;">✅ Inspection Passed</h4>
                  <p style="color: #155724; margin: 0;">
                    All inspection items have passed successfully. The vehicle is ready for delivery.
                  </p>
                </div>
              `}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${pdfLink}" class="button">Download Full Report (PDF)</a>
              </div>
              
              <h3>Next Steps</h3>
              <ul>
                <li>Review the detailed PDF report attached</li>
                <li>Address any failed inspection items before delivery</li>
                <li>Schedule delivery appointment once all items are resolved</li>
                <li>Contact customer service if you have any questions</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This report was generated by Tesla Delivery Companion</p>
              <p>Report ID: ${inspection.id} | Generated: ${new Date().toLocaleString()}</p>
              <p>For technical support, please contact our team.</p>
            </div>
          </body>
        </html>
      `;

      const textContent = `
Tesla Pre-Delivery Inspection Report
Order: ${inspection.orderNumber}

Vehicle Information:
- VIN: ${inspection.vin}
- Model: ${inspection.vehicleModel}
- Color: ${inspection.vehicleColor}
- Customer: ${inspection.customerName || 'N/A'}
- Inspection Date: ${new Date(inspection.createdAt).toLocaleDateString()}

Inspection Summary:
- Total Items: ${inspection.totalItems}
- Completed Items: ${inspection.completedItems}
- Failed Items: ${inspection.failedItems}

${inspection.failedItems > 0 ? 
  `⚠️ ATTENTION: This vehicle has ${inspection.failedItems} failed inspection item(s) that require attention before delivery.` :
  `✅ All inspection items have passed successfully. The vehicle is ready for delivery.`
}

Download the full report: ${pdfLink}

This report was generated by Tesla Delivery Companion.
Report ID: ${inspection.id}
Generated: ${new Date().toLocaleString()}
      `;

      // Send to sales rep (primary recipient)
      const salesEmailSuccess = await sendEmail({
        to: salesRepEmail,
        from: fromEmail,
        subject: subject,
        html: htmlContent,
        text: textContent,
      });

      // Send to customer (if email available)
      let customerEmailSuccess = true;
      if (customerEmail) {
        const customerSubject = `Your Tesla Pre-Delivery Inspection Report - Order ${inspection.orderNumber}`;
        const customerHtmlContent = htmlContent.replace(
          'Professional Vehicle Inspection Completed',
          'Your Vehicle Inspection Report'
        );
        
        customerEmailSuccess = await sendEmail({
          to: customerEmail,
          from: fromEmail,
          subject: customerSubject,
          html: customerHtmlContent,
          text: textContent,
        });
      }

      // Send to support team for tracking
      const supportEmail = process.env.SUPPORT_EMAIL;
      if (supportEmail) {
        await sendEmail({
          to: supportEmail,
          from: fromEmail,
          subject: `[TRACKING] Inspection Report Generated - ${inspection.orderNumber}`,
          html: htmlContent,
          text: textContent,
        });
      }

      return salesEmailSuccess && customerEmailSuccess;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  async sendNotificationEmail(
    to: string,
    subject: string,
    message: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<boolean> {
    try {
      const fromEmail = process.env.FROM_EMAIL || 'noreply@tesla-delivery-companion.com';
      
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background: #000; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .priority-high { border-left: 4px solid #dc3545; padding-left: 15px; }
              .priority-normal { border-left: 4px solid #007bff; padding-left: 15px; }
              .priority-low { border-left: 4px solid #28a745; padding-left: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Tesla Delivery Companion</h1>
              <p>System Notification</p>
            </div>
            
            <div class="content">
              <div class="priority-${priority}">
                <h2>${subject}</h2>
                <p>${message}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                <p>This is an automated notification from Tesla Delivery Companion</p>
                <p>Generated: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `;

      return await sendEmail({
        to,
        from: fromEmail,
        subject: `[Tesla Delivery] ${subject}`,
        html: htmlContent,
        text: `${subject}\n\n${message}\n\nGenerated: ${new Date().toLocaleString()}`,
      });
    } catch (error) {
      console.error('Notification email error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
