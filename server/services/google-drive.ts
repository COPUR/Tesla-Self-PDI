import { google } from 'googleapis';
import { Readable } from 'stream';

interface DriveUploadResult {
  id: string;
  webViewLink: string;
  webContentLink: string;
}

class GoogleDriveService {
  private drive: any;
  private folderId: string;

  constructor() {
    // Initialize Google Drive API client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.drive = google.drive({ version: 'v3', auth });
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root';
  }

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    retryCount = 0
  ): Promise<DriveUploadResult> {
    try {
      const stream = Readable.from(buffer);
      
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [this.folderId],
        },
        media: {
          mimeType,
          body: stream,
        },
        fields: 'id,webViewLink,webContentLink',
      });

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return {
        id: response.data.id,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      console.error('Google Drive upload error:', error);
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.uploadFile(buffer, fileName, mimeType, retryCount + 1);
      }
      
      throw new Error(`Failed to upload file after ${retryCount + 1} attempts`);
    }
  }

  async resumableUpload(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<DriveUploadResult> {
    try {
      // For larger files, implement resumable upload
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [this.folderId],
        },
        media: {
          mimeType,
          body: Readable.from(buffer),
        },
        fields: 'id,webViewLink,webContentLink',
        uploadType: 'resumable',
      });

      return {
        id: response.data.id,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      console.error('Google Drive resumable upload error:', error);
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
